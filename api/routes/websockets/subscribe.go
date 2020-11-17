package websockets

import (
	"net/http"
	"strings"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	subscribedTopics, _ = newTopicsFromSlice([]string{"^batch*.", "^extract*.", "^transform*.", "^load*."})
)

type Topics map[string]struct{}

func newTopicsFromString(in string) (Topics, error) {
	topics := Topics{}
	for _, t := range strings.Split(in, ",") {
		topics[t] = struct{}{}
	}
	return topics, nil
}

func newTopicsFromSlice(in []string) (Topics, error) {
	topics := Topics{}
	for _, t := range in {
		topics[t] = struct{}{}
	}
	return topics, nil
}

func (t Topics) Slice() []string {
	topics := make([]string, 0, len(t))
	for topic := range t {
		topics = append(topics, topic)
	}
	return topics
}

func (t Topics) Validate() error {
	for topic := range t {
		if _, ok := subscribedTopics[topic]; !ok {
			return errors.Errorf(
				"cannot subscribe to topic '%s', only [%s] are handled",
				topic,
				subscribedTopics,
			)
		}
	}
	return nil
}

type Subscriber struct {
	conn   *websocket.Conn
	topics Topics
	send   chan []byte
}

type Hub struct {
	// Kafka consumer
	consumer *kafka.Consumer

	// Registered subscribers.
	subscribers map[*Subscriber]bool

	// Register requests from the subscribers.
	register chan *Subscriber

	// Unregister requests from subscribers.
	unregister chan *Subscriber
}

func (h *Hub) notifySubscribers() {
	for {
		select {
		case subscriber := <-h.register:
			log.Infof("Registered subscriber %+v\n", subscriber)
			h.subscribers[subscriber] = true
		case subscriber := <-h.unregister:
			if _, ok := h.subscribers[subscriber]; ok {
				delete(h.subscribers, subscriber)
				close(subscriber.send)
			}
		case event := <-h.consumer.Events():
			if err := h.handleEvent(event); err != nil {
				log.Errorf("Error while handling kafka event: %s", err)
			}
		}
	}
}

func (h *Hub) handleEvent(event kafka.Event) error {
	switch ev := event.(type) {
	case *kafka.Message:
		for subscriber := range h.subscribers {
			select {
			case subscriber.send <- ev.Value:
				log.WithFields(log.Fields{"key": ev.Key, "topic": ev.TopicPartition}).
					Infof("Delivered message to %v\n", subscriber.conn.RemoteAddr())
			default:
				close(subscriber.send)
				delete(h.subscribers, subscriber)
			}
		}
	case kafka.Error:
		if ev.Code() == kafka.ErrAllBrokersDown {
			panic(ev)
		}
		return ev
	}
	return nil
}

func Subscribe(consumer *kafka.Consumer) func(http.ResponseWriter, *http.Request) {

	if err := consumer.SubscribeTopics(subscribedTopics.Slice(), nil); err != nil {
		panic(err)
	}

	hub := Hub{
		consumer:    consumer,
		subscribers: make(map[*Subscriber]bool),
		register:    make(chan *Subscriber),
		unregister:  make(chan *Subscriber),
	}
	go hub.notifySubscribers()

	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		// register the new subscriber in the hub
		topics, err := newTopicsFromString(r.URL.Query().Get("topics"))
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		} else if len(topics) == 0 {
			http.Error(w, "at least one topic should be provided as query parameter", http.StatusBadRequest)
			return
		} else if err := topics.Validate(); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		subscriber := &Subscriber{conn: conn, topics: topics, send: make(chan []byte, 256)}
		hub.register <- subscriber
		defer func() {
			hub.unregister <- subscriber
			if err := subscriber.conn.Close(); err != nil {
				log.Println(err)
			}
		}()

		incomingMessages := make(chan bool)
		go func() {
			for {
				// Read message from browser
				_, _, err := conn.ReadMessage()
				if err != nil {
					close(incomingMessages)
					return
				}
				incomingMessages <- true
			}
		}()

		for {
			select {
			case message, ok := <-subscriber.send:
				_ = subscriber.conn.SetWriteDeadline(time.Now().Add(1 * time.Second))
				if !ok {
					// The hub closed the channel.
					_ = subscriber.conn.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}

				if err := subscriber.conn.WriteMessage(websocket.TextMessage, message); err != nil {
					log.WithError(err).Error("error sending message to client")
				}
			case _, ok := <-incomingMessages:
				if !ok {
					log.Infof("Client %s disconnected", conn.RemoteAddr())
					return
				}
			}
		}
	}
}

package com.stuart.events.utils

import java.time.{Instant, ZoneOffset}
import java.time.format.DateTimeFormatter

import akka.actor.{
  Actor,
  ActorRef,
  ActorSystem,
  OneForOneStrategy,
  Props,
  SupervisorStrategy
}
import cakesolutions.kafka.KafkaConsumer
import cakesolutions.kafka.akka.KafkaConsumerActor.{Confirm, Subscribe}
import cakesolutions.kafka.akka.{ConsumerRecords, KafkaConsumerActor, Offsets}
import com.typesafe.scalalogging.LazyLogging
import org.apache.avro.generic.GenericRecord
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.common.TopicPartition
import org.joda.time.DateTime

import scala.concurrent.duration._

object SimpleConsumer {

  private val fmt: DateTimeFormatter = DateTimeFormatter.ISO_ZONED_DATE_TIME

  /*
   * Starts an ActorSystem and instantiates the below Actor that subscribes and
   * consumes from the configured KafkaConsumerActor.
   */
  def apply(consumerConf: KafkaConsumer.Conf[String, GenericRecord],
            topic: String,
            from: DateTime): ActorRef = {
    val actorConf = KafkaConsumerActor.Conf(1.seconds, 3.seconds)

    val system = ActorSystem()
    system.actorOf(
      Props(new SimpleConsumer(consumerConf, actorConf, topic, from))
    )
  }
}

class SimpleConsumer(kafkaConfig: KafkaConsumer.Conf[String, GenericRecord],
                     actorConfig: KafkaConsumerActor.Conf,
                     topic: String,
                     from: DateTime)
    extends Actor
    with LazyLogging {

  import SimpleConsumer._

  private val recordsExt = ConsumerRecords.extractor[String, GenericRecord]

  private val consumer =
    context.actorOf(KafkaConsumerActor.props(kafkaConfig, actorConfig, self))
  context.watch(consumer)

  val partition = new TopicPartition(topic, 0)
  consumer ! Subscribe.ManualOffsetForTimes(
    Offsets(Map(partition -> from.getMillis))
  )

  override def supervisorStrategy: SupervisorStrategy =
    OneForOneStrategy(maxNrOfRetries = 1) {
      case _ => SupervisorStrategy.Stop
    }

  override def receive: Receive = {

    // Records from Kafka
    case recordsExt(records) =>
      processRecords(records.recordsList)
      sender() ! Confirm(records.offsets)
  }

  private def eventToString(event: GenericRecord): String = {
    Option(event)
      .map { event =>
        val createdAt = fmt.format(
          Instant
            .ofEpochMilli(event.get("created_at").asInstanceOf[Long])
            .atOffset(ZoneOffset.UTC)
        )
        val msg = event.get("msg").asInstanceOf[GenericRecord]
        val msgType = msg.getSchema.getFullName

        s"""{"created_at": "$createdAt", "msg": {"$msgType" : $msg}}"""

      }
      .getOrElse("null")

  }

  private def processRecords(
    records: List[ConsumerRecord[String, GenericRecord]]
  ) =
    records.foreach { record =>
      val timestamp = fmt.format(
        Instant.ofEpochMilli(record.timestamp()).atOffset(ZoneOffset.UTC)
      )
      val offset = record.offset()
      val event: String = eventToString(record.value())
      logger.info(
        s"""{"offset": $offset, "timestamp": "$timestamp", "event": $event}"""
      )
    }
}

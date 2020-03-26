package com.stuart.events.utils

import java.io.{ File, FileInputStream }
import java.util.Scanner

import cakesolutions.kafka.KafkaProducerRecord.Destination
import cakesolutions.kafka.{ KafkaConsumer, KafkaProducer, KafkaProducerRecord }
import com.stuart.commands.v2.DispatcherCommand
import com.stuart.dispatcher.BuildInfo
import com.stuart.events.v1.BusinessEvent
import com.stuart.events.v2
import com.stuart.serde.generic.{ GenericKafkaAvroDeserializer, GenericKafkaAvroSerializer }
import com.stuart.serde.legacy.generic.{ GenericSchemaLessAvroDeserializer, GenericSchemaLessAvroSerializer }
import com.typesafe.scalalogging.LazyLogging
import org.apache.avro.Schema
import org.apache.avro.generic.{ GenericDatumReader, GenericRecord }
import org.apache.avro.io.DecoderFactory
import org.apache.kafka.clients.consumer.OffsetResetStrategy
import org.apache.kafka.clients.producer.ProducerRecord
import org.apache.kafka.common.serialization.{ Deserializer, Serializer, StringDeserializer, StringSerializer }
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat

import scala.concurrent.Await
import scala.concurrent.duration._

object KafkaConsoleTool extends App with LazyLogging {
  private val DISPATCHER_COMMANDS_TOPIC: String = "dispatcher-commands"
  case class OptConfig(
    messages: Option[File] = None,
    bootstrapServers: String = "localhost:9092",
    schemaRegistryUrl: Option[String] = None,
    topic: String = "barcelona",
    from: DateTime = DateTime.now(),
    mode: String = "consumer",
    group: String = "kafka-console-tool-" + DateTime.now().getMillis,
    pooling: Boolean = false,
    timestamps: Boolean = false)

  implicit val optDatetime: scopt.Read[DateTime] = scopt.Read.reads(ISODateTimeFormat.dateTimeParser().parseDateTime(_))

  val optParser = new scopt.OptionParser[OptConfig]("KafkaConsoleTool") {
    head("KafkaConsoleTool", BuildInfo.version, BuildInfo.builtAtString)

    opt[String]('u', "bootstrap-severs").valueName("<server:port,server:port>").required().
      action((x, c) => c.copy(bootstrapServers = x)).
      text("Kafka's bootstrap servers")

    opt[String]('r', "schema-registry-url").valueName("http://schema-registry:port").
      action((x, c) => c.copy(schemaRegistryUrl = Some(x))).
      text("Schema Registry URL")

    opt[String]('t', "topic").valueName("<kafka topic>").
      action((x, c) => c.copy(topic = x)).
      text("Kafka's topic where to produce/consume messages")

    opt[Unit]('p', "pooling").
      action((_, c) => c.copy(pooling = true)).
      text("Use new pooling schemas")

    opt[Unit]('c', "commands").
      action((_, c) => c.copy(topic = DISPATCHER_COMMANDS_TOPIC)).
      text("Read commands")

    cmd("producer").action((_, c) => c.copy(mode = "producer"))
      .children(
        opt[File]('f', "file").valueName("<messages.json>").
          action((x, c) => c.copy(messages = Some(x))).
          text("File with all messages encoded as JSON"),
        opt[Unit]('m', "timestamps")
          .action((_, c) => c.copy(timestamps = true))
          .text("Use timestamp from events on Kafka Records"))
    cmd("consumer").action((_, c) => c.copy(mode = "consumer"))
      .children(
        opt[DateTime]('f', "from").valueName("<YYYY-MM-DD hh:mm:ss>")
          .action((x, c) => c.copy(from = x))
          .text("Timestamp of the first message to retrieve"),
        opt[String]('g', "group").valueName("<group-name>")
          .action((x, c) => c.copy(group = x))
          .text("Kafka Consumer Group"))
  }

  optParser.parse(args, OptConfig()) match {
    case Some(optConfig) =>
      optConfig.mode match {
        case "consumer" => consume(optConfig)
        case "producer" => produce(optConfig)
      }
    case None =>
  }

  private def consume(config: OptConfig): Unit = {
    require(!config.pooling || config.schemaRegistryUrl.isDefined, "Pooling only work with schema registry")

    val deserializer = getDeserializer(config)

    val conf = KafkaConsumer.Conf(
      new StringDeserializer(),
      deserializer,
      bootstrapServers = config.bootstrapServers,
      groupId = config.group,
      enableAutoCommit = false,
      autoOffsetReset = OffsetResetStrategy.LATEST)
    SimpleConsumer(conf, config.topic, config.from)
  }

  private def produce(config: OptConfig): Unit = {
    require(!config.pooling || config.schemaRegistryUrl.isDefined, "Pooling only work with schema registry")

    val (schema, serializer) = getSchemaAndSerializer(config)

    val reader = new GenericDatumReader[GenericRecord](schema)

    val conf = KafkaProducer.Conf(
      new StringSerializer(),
      serializer,
      bootstrapServers = config.bootstrapServers)

    val producer = KafkaProducer(conf)

    val scanner = new Scanner(config.messages match {
      case Some(file) => new FileInputStream(file)
      case None => System.in
    })

    var records = 0
    while (scanner.hasNext) {
      val line = scanner.nextLine()
      val decoder = DecoderFactory.get().jsonDecoder(schema, line)
      val event = reader.read(null, decoder)
      val timestamp = if (config.timestamps) {
        Some(event.get("created_at").asInstanceOf[Long])
      } else {
        None
      }
      val record: ProducerRecord[String, GenericRecord] =
        KafkaProducerRecord(new Destination(config.topic, None), None, event, timestamp = timestamp)

      val future = producer.send(record)
      Await.result(future, 5.seconds)
      records = records + 1
    }
    logger.info(s"Successfully sent $records messages")

  }

  private def getSchemaAndSerializer(config: OptConfig): (Schema, Serializer[GenericRecord]) =
    (config.schemaRegistryUrl, config.pooling) match {
      case (Some(url), true) => (v2.BusinessEvent.SCHEMA$, new GenericKafkaAvroSerializer[v2.BusinessEvent](url))
      case (Some(url), false) => (BusinessEvent.SCHEMA$, new GenericKafkaAvroSerializer[BusinessEvent](url))
      case (None, true) => (v2.BusinessEvent.SCHEMA$, new GenericSchemaLessAvroSerializer(Some(v2.BusinessEvent.SCHEMA$)))
      case (None, false) => (BusinessEvent.SCHEMA$, new GenericSchemaLessAvroSerializer(Some(BusinessEvent.SCHEMA$)))
    }

  private def getDeserializer(config: OptConfig): Deserializer[GenericRecord] =
    (config.schemaRegistryUrl, config.pooling, config.topic) match {
      case (Some(url), true, DISPATCHER_COMMANDS_TOPIC) => new GenericKafkaAvroDeserializer[DispatcherCommand](url)
      case (Some(url), true, _) => new GenericKafkaAvroDeserializer[v2.BusinessEvent](url)
      case (Some(url), false, _) => new GenericKafkaAvroDeserializer[BusinessEvent](url)
      case (None, true, _) => new GenericSchemaLessAvroDeserializer(v2.BusinessEvent.SCHEMA$)
      case (None, false, _) => new GenericSchemaLessAvroDeserializer(BusinessEvent.SCHEMA$)
    }
}


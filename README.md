# FHIR River - WIP

POC for Live Streams usng Kafka and Kafka Connect

## Architecture

- Source: PostgreSQL *MIMIC*
- Destination: MongoDB
- Event bus: Kafka
- Source Connector : Kafka Connect (JDBC Connector) 
- Sink Connector : Kafka Connect (MongoDB Connector)

## Useful links

- [Live Streams ETL](https://qconsf.com/sf2016/system/files/keynotes-slides/etl_is_dead_long-live_streams.pdf)
- [Getting Started with Kafka Connect](https://docs.confluent.io/current/connect/userguide.html)
- [JDBC Source Connector](https://docs.confluent.io/current/connect/kafka-connect-jdbc/source-connector/index.html)
- [MongoDB Sink Connector](https://www.mongodb.com/blog/post/getting-started-with-the-mongodb-connector-for-apache-kafka-and-mongodb-atlas)

## Useful commands

- docker exec -it mongo mongo --port 27017
- docker exec -it mimic psql -U mimicuser -d mimic

## Avro Consumer and Producer

The `fhir_consumer` container includes a consumer and a producer. You can connect into the container and launch the `producer.py`.
That will produce test events into a kafka topic, that will be consumed by the consumer.
 

## Kafka Connect

This folder is intended to contain the configuration files in `json` format used to start connectors in the 
[kafka-connect](https://docs.confluent.io/current/connect/) cluster.
In this POC, the configuration files and the actual kafka connect cluster are stored in the same repo, but we should 
have 2 different repos in the future, to avoid re-deploying the cluster for each new config.

The config files should be added to the ./kafka-connect folder and depending if they are for a source or a sink they will go in each respective folder.
A new connector is launched in the cluster by using one of the following two requests:
- `curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" http://localhost:8083/connectors/ -d <config.json>'`
    - Only to create a new connector (Not idempotent)
- `curl -i -X PUT -H "Accept:application/json" -H "Content-Type:application/json" http://localhost:8083/connectors/{name}/config -d <config_without_name.json>'`
    - To create or update, an existing, connector (idempotent)

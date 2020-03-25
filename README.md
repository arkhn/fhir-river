# FHIR River

POC for Live Streams 

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

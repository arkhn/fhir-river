# FHIR River - WIP

POC for Live Streams usng Kafka and Kafka Connect

## Architecture

This repo is a POC for Live Streams ETL.

A Kafka broker is used as a bus of event.
The source of data is a Postgresdb. Whenever a new record is created, an event is created by kafka-connect.
The consumer can then consume the event and transform it. 

WIP

## Getting started

1. Run `docker-compose up --build`: it will create the container for the different services.  
Note that it can take few minutes at first. The logs are quite verbose, don't be afraid ! 

2. Create the configuration for kafka-connect  (See Kafka Connect section below). 

3. Play with it: run the script to create some records in the MIMIC db: `python test/create_records_db.py` (ugly script, 
but it works fine just to test that it works)
You can see in the logs of the `fhir_consumer` container the message and its topic. You can check inside the MIMIC DB
 that your record has been created (check config in the script - WIP)

4. Play with it: in the script `fhir_consumer/src/main.py`, edit the function `process_event` to do whatever you want!

## Avro Consumer

The `fhir_consumer` container includes a consumer that reads events produced by kafka-connect whenever a new record is 
created in the PostgresDb.

## Useful links

- [Live Streams ETL](https://qconsf.com/sf2016/system/files/keynotes-slides/etl_is_dead_long-live_streams.pdf)
- [Getting Started with Kafka Connect](https://docs.confluent.io/current/connect/userguide.html)
- [JDBC Source Connector](https://docs.confluent.io/current/connect/kafka-connect-jdbc/source-connector/index.html)
- [MongoDB Sink Connector](https://www.mongodb.com/blog/post/getting-started-with-the-mongodb-connector-for-apache-kafka-and-mongodb-atlas)
- [JBDCSourceConnectors Example](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector/#specifying-tables)

## Useful commands

- docker exec -it mongo mongo --port 27017
- docker exec -it mimic psql -U mimicuser -d mimic


## Kafka Connect

This folder is intended to contain the configuration files in `json` format used to start connectors in the 
[kafka-connect](https://docs.confluent.io/current/connect/) cluster.
In this POC, the configuration files and the actual kafka connect cluster are stored in the same repo, but we should 
have 2 different repos in the future, to avoid re-deploying the cluster for each new config.

The config files should be added to the ./kafka_connect_connectors folder and depending if they are for a source or a sink they will go in each respective folder.
A new connector is launched in the cluster by using one of the following two requests:
- `curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" http://localhost:8083/connectors/ -d '<config.json>'`
    - Only to create a new connector (Not idempotent)
- `curl -i -X PUT -H "Accept:application/json" -H "Content-Type:application/json" http://localhost:8083/connectors/{name}/config -d '<config_without_name.json>'`
    - To create or update, an existing, connector (idempotent)

with `<config.json>` being the configuration in `kafka_connect_connectors/sources` (copy/paste) and `<config_without_name.json>` 
being only what the value associated to the key `config`.

Note: More info regarding Kafka Connect REST API [here](https://docs.confluent.io/current/connect/references/restapi.html).


## SFTP 

```docker run     -v /Users/a.barakat/Documents/Arkhn/fhir-river/test/sftp/host/upload:/home/arkhn/upload     -p 2222:22 -d atmoz/sftp     arkhn:arkhnpwd:1001``` 
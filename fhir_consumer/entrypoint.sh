#!/usr/bin/env bash

sleep 10s;
python fhir_consumer/src/consumer.py "$KAFKA_BOOTSTRAP_SERVERS" "$AVRO_REGISTRY_URL"
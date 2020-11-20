#!/bin/sh
export FHIR_API_TOKEN=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiY2thejJvMzhnMDAwNjM5cDlrMjZuMXNjdCIsImVtYWlsIjoiYWRtaW5AYXJraG4uY29tIiwibmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiIkMmEkMTAkL0xSeVpzS0RnUU5CS1lwS1oyemM0ZU5Sc0U5T3l3M3d3ZC4vL2l0bXB2ZVFqZmxPYi82TEMiLCJyb2xlIjoiVVNFUiIsInVwZGF0ZWRBdCI6IjIwMjAtMDYtMDNUMDg6MTE6NDQuNjA4WiIsImNyZWF0ZWRBdCI6IjIwMjAtMDYtMDNUMDg6MTE6NDQuNjA4WiJ9LCJpYXQiOjE1OTExODA5NjN9.QkBMpczoYA4_W5PCb4WVKo1pBgvSjK9mjvXoLnG90Qyuv5XhNYGmot07rwtTBukw5pqij30SADAFHCtkeKBYjg
export AUTH_SIGNING_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEIFCLWe5DAw/qXbVcKJ8GTUUrSrVezUW16jQCdeTpRsLjoAcGBSuBBAAK\noUQDQgAEnC5rKUa/mrpOSb0jRxDT2ZCkZrhVqnT1RKZ0BgSEZhOGzOnpyIpnybHD\nvpWTcR4VTKTFsuNiHLTewr/eoH9tTw==\n-----END EC PRIVATE KEY-----"
export AUTH_SIGNING_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEnC5rKUa/mrpOSb0jRxDT2ZCkZrhVqnT1\nRKZ0BgSEZhOGzOnpyIpnybHDvpWTcR4VTKTFsuNiHLTewr/eoH9tTw==\n-----END PUBLIC KEY-----"
export PYROG_API_URL="http://0.0.0.0:1000"
export PYROG_LOGIN=admin@arkhn.com
export PYROG_PASSWORD=password
export KAFKA_BOOTSTRAP_SERVERS_EXTERNAL="0.0.0.0:9092"
export TEST=true
export FHIRSTORE_HOST=localhost
export FHIRSTORE_PORT=27017
export FHIRSTORE_DATABASE=fhirstore
export FHIRSTORE_USER=arkhn
export FHIRSTORE_PASSWORD=SuperSecurePassword2019

docker-compose up -d mongo mimic elasticsearch monstache kafka zookeeper
sleep 15q
MONGO_USERNAME=arkhn MONGO_PASSWORD=SuperSecurePassword2019 ./initiate_rep_set.sh
sleep 15
docker-compose up -d fhir-api
sleep 15
docker exec fhir-api python3 scripts/upload_bundles.py fhir_bundles/resources.json fhir_bundles/conceptMaps.json
docker-compose up -d postgres redis pyrog-server
docker-compose up -d pyrog-server
sleep 30
docker exec --env SUPERUSER_PASSWORD="password" pyrog-server yarn seed:superuser
docker exec pyrog-server yarn seed:mapping /app/mapping.json /app/credentials.json
docker-compose up -d --build api extractor transformer loader
docker restart fhir-api

python -m pytest -svv test_batch.py
python -m pytest -svv test_loader_reference_binder.py

docker-compose down -v

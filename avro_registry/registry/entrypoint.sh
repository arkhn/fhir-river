#!/bin/bash
envsubst < /opt/hortonworks-registry/conf/registry.yaml.template > /opt/hortonworks-registry/conf/registry.yaml
./wait-for-it.sh $DB_HOST:$DB_PORT --timeout=30 --strict -- /opt/hortonworks-registry/bootstrap/bootstrap-storage.sh migrate
exec "$@"

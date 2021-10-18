#!/bin/sh
# POSTGRES_USER=toto POSTGRES_PASSWORD=tata wait-for-postgres.sh <host> <port> <database>

set -e
  
host="$1"
port="$2"
database="$3"
shift
shift
shift
  
until psql "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$host:$port/$database" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 10
done
  
>&2 echo "Postgres is up - executing command"
exec "$@"
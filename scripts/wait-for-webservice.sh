#!/bin/sh
# POSTGRES_USER=toto POSTGRES_PASSWORD=tata wait-for-postgres.sh <host> <port> <database>

set -e
  
attempt_counter=0
max_attempts=10

url="$1"
shift
  
until $(curl --output /dev/null --silent --head --fail $url); do

  if [ ${attempt_counter} -eq ${max_attempts} ];then
    echo "Max attempts reached"
    exit 1
  fi
  attempt_counter=$(($attempt_counter+1))
  
  >&2 echo "$url is unavailable - sleeping"
  sleep 10
done
  
>&2 echo "Service on $url is up - executing command"
exec "$@"
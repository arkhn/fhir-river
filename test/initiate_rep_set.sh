#!/bin/sh


i=0
while [ $i -lt 20 ]; do
  docker exec mongo mongo --username=${MONGO_USERNAME} --password=${MONGO_PASSWORD} --eval "rs.initiate()"
  break;
done
if [ $i -eq 20 ]; then exit 1; fi


echo "Replica Set is initiated - resuming execution"
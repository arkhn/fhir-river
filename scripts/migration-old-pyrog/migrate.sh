# This script does the data migration between the old and new pyrog schema

# Display usage if misued
if [ $# -ne 3 ]
  then
    echo "migrate.sh INPUT_MAPPING INPUT_CREDENTIALS OUTPUT_FILE"
    exit 1
fi

# Exit immediately if a command exits with a non-zero status.
set -e

# Trace execution
set -x

INPUT_MAPPING=$1
INPUT_CREDENTIALS=$2
OUTPUT_FILE=$3

SUPERUSER_USERNAME="admin"
SUPERUSER_EMAIL="admin@arkhn.com"
SUPERUSER_PASSWORD="admin"

# Import mapping to old pyrog
docker-compose run --rm --entrypoint yarn old-pyrog migrate:up
docker-compose run --rm --entrypoint yarn old-pyrog seed:mapping $INPUT_MAPPING $INPUT_CREDENTIALS || echo "mapping already exists, skipping..."

# Go to the matching migration (rollback if necessary)
docker-compose run --rm new-pyrog migrate pyrog 0002

# Migrate the data between the old and new schemas
docker-compose run --rm -e PGPASSWORD=migrate --entrypoint psql new-pyrog -h postgres -U migrate -d migrate -f /srv/django/pyrog/migrations/migrate.sql

# Run the remaining migrations
docker-compose run --rm new-pyrog migrate

# Create a superuser
docker-compose run \
    -e DJANGO_SUPERUSER_USERNAME=$SUPERUSER_USERNAME \
    -e DJANGO_SUPERUSER_EMAIL=$SUPERUSER_EMAIL \
    -e DJANGO_SUPERUSER_PASSWORD=$SUPERUSER_PASSWORD \
    new-pyrog createsuperuser --no-input \
    || echo "superuser already exists, skipping..."

# Up a pyrog container
docker-compose up -d new-pyrog

# Wait for pyrog to be up while retrieving sources
n=0
until [ "$n" -ge 10 ]
do
   SOURCE_ID=`curl --user $SUPERUSER_EMAIL:$SUPERUSER_PASSWORD -X GET http://localhost:8000/api/sources/` && break
   n=$((n+1)) 
   sleep 1
done
SOURCE_ID=$(echo $SOURCE_ID | jq -r ".[].id")

# Fetch the new mapping
# TODO use right mapping id
curl --user $SUPERUSER_EMAIL:$SUPERUSER_PASSWORD -X GET http://localhost:8000/api/sources/$SOURCE_ID/export/ | jq > $OUTPUT_FILE

# Stop running containers
docker-compose stop
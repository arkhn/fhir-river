# This script does the data migration between the old and new pyrog schema

INPUT_MAPPING=$1
INPUT_CREDENTIALS=$2
OUTPUT_FILE=$3

SUPERUSER_USERNAME="admin"
SUPERUSER_EMAIL="admin@arkhn.com"
SUPERUSER_PASSWORD="admin"

# Import mapping to old pyrog
docker-compose run --rm --entrypoint yarn old-pyrog migrate:up
docker-compose run --rm --entrypoint yarn old-pyrog seed:mapping $INPUT_MAPPING $INPUT_CREDENTIALS

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
    new-pyrog createsuperuser --no-input

# Up a pyrog container
docker-compose up -d new-pyrog

# Fetch the new mapping
# TODO use right mapping id
curl --user $SUPERUSER_EMAIL:$SUPERUSER_PASSWORD -X GET http://localhost:8000/api/sources/$SOURCE_ID/export/
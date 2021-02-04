#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Trace execution
[[ "${DEBUG}" ]] && set -x

# Set default key (not actually used)
if [[ "$1" == "extractor" ]] || [[ "$1" == "transformer" ]] || [[ "$1" == "loader" ]] || [[ "$1" == "topicleaner" ]]; then
  export SECRET_KEY="whatever"
fi

export DJANGO_SETTINGS_MODULE=river.settings."${ENV:-prod}"
export STATIC_ROOT="${FILES_ROOT}/static"

if [[ "$#" -gt 0 ]]; then
  python django/manage.py "$@"
else
  python django/manage.py migrate
  # Skip static files collection (not used)
  # python django/manage.py collectstatic --no-input
  if [[ "${ENV}" == "dev" ]]; then
    # Skip superuser creation (not used)
    # python django/manage.py createsuperuser --no-input || echo "Skipping."
    python django/manage.py runserver 0.0.0.0:8000
  else
    export UWSGI_PROCESSES=${UWSGI_PROCESSES:-5}
    export UWSGI_THREADS=${UWSGI_THREADS:-4}
    python django/manage.py check --deploy
    uwsgi --ini uwsgi.ini
  fi
fi
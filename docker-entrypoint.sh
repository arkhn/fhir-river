#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Trace execution
[[ "${DEBUG}" ]] && set -x

export DJANGO_SETTINGS_MODULE=river.settings."${ENV:-prod}"

if [[ "$#" -gt 0 ]]; then
  python django/manage.py "$@"
else
  python django/manage.py migrate
  # Skip static files collection (not used)
  # python django/manage.py collectstatic --no-input
  if [[ "${ENV}" == "dev" ]]; then
    python django/manage.py createsuperuser --no-input || echo "Skipping."
    python django/manage.py runserver 0.0.0.0:8000
  else
    export UWSGI_PROCESSES=${UWSGI_PROCESSES:-5}
    export UWSGI_THREADS=${UWSGI_THREADS:-4}

    # Keep using http protocol by default
    # TODO(vmttn): drop http. This require updating the deployment to make sure
    #   consuming services use the reverse proxy to communicate.
    if [[ ! -z "${UWSGI_USE_SOCKET}" ]]; then
      export UWSGI_SOCKET=0.0.0.0:8000
    else
      export UWSGI_HTTP=0.0.0.0:8000
    fi
    python django/manage.py check --deploy
    uwsgi --ini uwsgi.ini
  fi
fi
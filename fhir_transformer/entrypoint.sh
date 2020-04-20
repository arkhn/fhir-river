#!/usr/bin/env bash

sleep 5s;
# Run APP
uwsgi --ini fhir_transformer/uwsgi.ini --py-autoreload 1
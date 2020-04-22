#!/usr/bin/env bash

sleep 10s;
# Run APP
uwsgi --ini fhir_transformer/uwsgi.ini --py-autoreload 1
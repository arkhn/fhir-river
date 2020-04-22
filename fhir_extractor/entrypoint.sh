#!/usr/bin/env bash

# Run APP
uwsgi --ini fhir_extractor/uwsgi.ini --py-autoreload 1
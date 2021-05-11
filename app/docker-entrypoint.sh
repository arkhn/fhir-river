#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Trace execution
[[ "${DEBUG}" ]] && set -x

export STATIC_ROOT="${STATIC_ROOT:-/var/www/static/pyrog-app}"

yarn build
rm -rf "${STATIC_ROOT}" && cp -r ./build "${STATIC_ROOT}"
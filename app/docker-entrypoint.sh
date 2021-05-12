#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Trace execution
[[ "${DEBUG}" ]] && set -x

export STATIC_ROOT="${STATIC_ROOT:-/var/www/static/pyrog-app}"

yarn build

# template build/index.html using environment variables
sed -i -e "s/{{REACT_APP_API_URL}}/$REACT_APP_API_URL/g" \
    ./build/index.html

rm -rf "${STATIC_ROOT}" && cp -r ./build "${STATIC_ROOT}"
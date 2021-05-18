#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Trace execution
[[ "${DEBUG}" ]] && set -x

export STATIC_ROOT="${STATIC_ROOT:-/var/www/static/pyrog-app}"

# template build/index.html using environment variables
sed -i \
    -e "s|{{PUBLIC_URL}}|$PUBLIC_URL|g" \
    -e "s|{{API_URL}}|$API_URL|g" \
    -e "s|{{OIDC_LOGIN_URL}}|$OIDC_LOGIN_URL|g" \
    -e "s|{{OIDC_LOGOUT_URL}}|$OIDC_LOGOUT_URL|g" \
    -e "s|{{CSRF_COOKIE_NAME}}|$CSRF_COOKIE_NAME|g" \
    ./build/index.html

rm -rf "${STATIC_ROOT}" && cp -r ./build "${STATIC_ROOT}"
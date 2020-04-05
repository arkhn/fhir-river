#!/usr/bin/env bash

# Run Unitest
#nose2 -t src --plugin nose2.plugins.junitxml --coverage-report xml --coverage-config .coveragerc
python `which nose2` --with-coverage
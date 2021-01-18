# Contributing

## Project structure

    .
    ├── api/                            # River-api
    ├── django/
    |   ├── common/                     # Common modules
    |   ├── control/                    # Control-api app
    |   ├── core/                       # App for framework level endpoints (e.g. version)
    |   ├── extractor/                  # Extractor app
    |   ├── loader/                     # Loader app
    |   ├── river/                      # Django project config
    |   ├── transformer/                # Transformer app
    |   ├── utils/                      # Utility class/functions
    |   └── manage.py                   # Django management script
    ├── monitoring/                     # Configs for monitoring services
    └── .template.env                   # Template env file

The project is mainly structured as a django project (except for the `river-api`) : The codebase is shared between all ETL services (`extractor`, `transformer`, `loader`).

The services are deployed as the same docker `arkhn/river` image, but are run with different arguments (See the `docker-compose.yml` file).

`control-api` acts as an interface for the ETL services and will progressively replace the `river-api`.

## Deployment

### OS Prerequisites

* `docker`
* `docker-compose >= 3.7`

### Available compose files

This repository contains 3 compose files that can be used for development.

#### `docker-compose.yml`

Contains the main services of the ETL. This is the minimal functional configuration.

You must provide `fhir-api` and `pyrog-api` URLs (which means you have them deployed somewhere)

#### `docker-compose.monitoring.yml`

Contains optional monitoring services.

The services config files are in the root `monitoring` directory.

#### `docker-compose.test.yml`

Optional test services.

### Notes on environment

* Environment variables can be stored in a `.env` file in the root directory.
* The `.env` file is loaded by:
  * Django's `manage.py` script, in development,
  * Vscode's integrated terminal and launch commands,
  * Docker-compose's cli.

## Local development

### Local prerequisites

1. Create a virtual env

    python3.8 -m venv --prompt "(river) " .venv

2. Activate the virtual env

    source .venv/bin/activate

3. Install dev requirements

    pip install -r requirements/dev.txt

### Code quality

Code quality is enforced with `pre-commit` hooks: `black`, `isort`, `flake8`

1. Install the hooks

    precommit install

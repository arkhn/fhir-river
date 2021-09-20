# Contributing

## Docs

Documentation is auto-generated from the code using [pdocs](https://pdoc3.github.io/pdoc/)
To start a local webserver and access the docs, run:

```bash
# the following command will spin up a web server on 0.0.0.0:8080
python django/manage.py docs [--http HOST:PORT]
```

## Project structure

    .
    ├── django/            # Backend (api, ETL services, etc.)
    ├── monitoring/        # Configs for monitoring services
    ├── tests/             # Backend tests
    ├── pyrog-schema.yml   # OpenAPI spec for the pyrog api
    └── .template.env      # Template env file

The project is structured as a django project. The codebase is shared between the API and the ETL services (`extractor`, `transformer`, `loader`).

The services are deployed as the same docker `arkhn/river` image, but are run with different arguments (See the `docker-compose.yml` file).

## Deployment

### OS Prerequisites

- `docker`
- `docker-compose >= 3.7`

### Available compose files

This repository contains 3 compose files that can be used for development.

|                                 |                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `docker-compose.yml`            | The minimal functional configuration. `fhir-api` and `pyrog-api` URLs must be provided. |
| `docker-compose.monitoring.yml` | Optional monitoring services. Configuration is store in the root `monitoring` directory |
| `docker-compose.test.yml`       | Optional services for testing (e.g. `mimic`)                                            |

### Notes on environment

- Environment variables can be stored in a `.env` file in the root directory.
- The `.env` file is shared and loaded by:
  - `docker-compose`,
  - Django's `manage.py` script,
  - Vscode's integrated terminal and launch commands.

## Backend development

### Local prerequisites

```bash
# 1. Create a virtual env
python3.8 -m venv --prompt "river" .venv

# 2. Activate the virtual env
source .venv/bin/activate

# 3. Install unixodbc-dev package
sudo apt install unixodbc-dev

# 4. Install dev requirements
pip install -r requirements/dev.txt
```

### Developing with the development server

This concerns the API. Not the ETL services (which are not web applications).

First, you'll need to provide configuration by creating a dotenv file (`.env`).

```bash
# 1. Copy the dotenv file. The template should be enough to get you started.
cp .template.env .env

# 2. Bring the db up
docker-compose up -d db

# 3. Migrate
python django/manage.py migrate

# 4. Run the development server
python django/manage.py runserver
```

### Registering the oauth application

In order to register a local OIDC application, use the admin interface of the identity provider
See [documentation](https://github.com/arkhn/o-provider/blob/main/FAQ.md#comment-cr%C3%A9er-une-application-)

### Code quality

Code quality is enforced with `pre-commit` hooks: `black`, `isort`, `flake8`

```bash
# Install the hooks
pre-commit install
```

### Tests

```bash
# Run tests in dedicated virtual env
tox
```

### OpenAPI schema generation

Generation only concerns the `pyrog` application at this point. To generate the schema (no virtual env required):

      tox -e openapi

This produces a `pyrog-schema.yml` file in the root project directory.

## Frontend development

### Backend setup

First, you'll need to provide configuration by creating a dotenv file (`.env`).

```bash
# 1. Copy the dotenv file. The template should be enough to get you started.
cp .template.env .env

# 2. Bring the db up
docker-compose up -d db

# 3. Bring the backend up
docker-compose up river-api

# 4. (Optionally) To quickly create resources, visit the admin panel
# at http://localhost:8000/admin/
# username: admin
# password: admin
```

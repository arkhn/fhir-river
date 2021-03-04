# HAPI_FHIR loader

This service's role is to load FHIR resources into a HAPI postgres database.

# Dependencies

- java >= 15
- (Optional) python >=3.6

# Installation

```shell
# install dependencies and build project
mvn clean install

# Install dependencies for the test python producer
# 1. Create a virtual env
python3 -m venv --prompt "hapi-loader" .venv

# 2. Activate the virtual env
source .venv/bin/activate

# 3. Install dev requirements
pip install -r test_producer/requirements.txt
```

## Usage

```shell
# up postgres, kafka, zookeeper, elasticsearch, and kibana
docker-compose up -d

# run hapi-loader and wait for incoming events
mvn spring-boot run

# produce test events
# (assumes a fhirdata/ folder containing .ndjson files exist)
python test_producer/producer.py fhirdata/
```

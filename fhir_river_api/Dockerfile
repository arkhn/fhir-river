FROM python:3.7-slim

ARG FHIR_RIVER_API_HOME=/river
ENV PYTHONPATH=${FHIR_RIVER_API_HOME}

WORKDIR ${FHIR_RIVER_API_HOME}

COPY requirements.txt ${FHIR_RIVER_API_HOME}/requirements.txt

RUN pip install -r ${FHIR_RIVER_API_HOME}/requirements.txt

COPY src ${FHIR_RIVER_API_HOME}/fhir_river_api/src

COPY entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

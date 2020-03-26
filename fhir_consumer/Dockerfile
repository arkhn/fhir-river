FROM python:3.7-slim

ARG CONSUMER_HOME=/app
ENV PYTHONPATH=${CONSUMER_HOME}

WORKDIR ${CONSUMER_HOME}

COPY requirements.txt ${CONSUMER_HOME}/requirements.txt

RUN pip install -r ${CONSUMER_HOME}/requirements.txt

COPY /src ${CONSUMER_HOME}/fhir_consumer/src

COPY /entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

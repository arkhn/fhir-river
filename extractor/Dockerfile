FROM python:3.7-slim

RUN apt-get update \
    && apt-get -y install build-essential

ARG EXTRACTOR_SQL_HOME=/app
ENV PYTHONPATH=${EXTRACTOR_SQL_HOME}

WORKDIR ${EXTRACTOR_SQL_HOME}

COPY extractor/requirements.txt ${EXTRACTOR_SQL_HOME}/requirements.txt

RUN pip install -r ${EXTRACTOR_SQL_HOME}/requirements.txt

COPY extractor/src ${EXTRACTOR_SQL_HOME}/extractor/src
COPY analyzer/src ${EXTRACTOR_SQL_HOME}/analyzer/src

COPY extractor/uwsgi.ini ${EXTRACTOR_SQL_HOME}/extractor/uwsgi.ini

COPY extractor/entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

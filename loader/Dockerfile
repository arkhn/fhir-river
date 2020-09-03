FROM python:3.7-slim

RUN apt-get update \
    && apt-get -y install build-essential git

ARG LOADER_HOME=/app
ENV PYTHONPATH=${LOADER_HOME}

WORKDIR ${LOADER_HOME}

COPY loader/requirements.txt ${LOADER_HOME}/requirements.txt

RUN pip install -r ${LOADER_HOME}/requirements.txt

COPY loader/src ${LOADER_HOME}/loader/src
COPY analyzer/src ${LOADER_HOME}/analyzer/src

COPY loader/uwsgi.ini ${LOADER_HOME}/loader/uwsgi.ini

COPY loader/entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

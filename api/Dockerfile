FROM python:3.7-slim

RUN apt-get update \
    && apt-get -y install build-essential

ARG API_HOME=/river
ENV PYTHONPATH=${API_HOME}

WORKDIR ${API_HOME}

COPY api/requirements.txt ${API_HOME}/requirements.txt

RUN pip install -r ${API_HOME}/requirements.txt

COPY api/src ${API_HOME}/api/src
COPY logger ${API_HOME}/logger

COPY api/uwsgi.ini ${API_HOME}/api/uwsgi.ini

COPY api/entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

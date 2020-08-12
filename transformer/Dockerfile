FROM python:3.7-slim

# Dependencies
RUN apt-get update \
    && apt-get -y install build-essential

ARG TRANSFORMER_HOME=/app
ENV PYTHONPATH=${TRANSFORMER_HOME}

WORKDIR ${TRANSFORMER_HOME}

COPY transformer/requirements.txt ${TRANSFORMER_HOME}/requirements.txt

RUN pip install -r ${TRANSFORMER_HOME}/requirements.txt

COPY transformer/src ${TRANSFORMER_HOME}/transformer/src
COPY analyzer/src ${TRANSFORMER_HOME}/analyzer/src
COPY monitoring ${TRANSFORMER_HOME}/monitoring

COPY transformer/uwsgi.ini ${TRANSFORMER_HOME}/transformer/uwsgi.ini

COPY transformer/entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

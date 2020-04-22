FROM python:3.7-slim

# Dependencies
RUN apt-get update \
    && apt-get -y install build-essential

ARG TRANSFORMER_HOME=/app
ENV PYTHONPATH=${TRANSFORMER_HOME}

WORKDIR ${TRANSFORMER_HOME}

COPY requirements.txt ${TRANSFORMER_HOME}/requirements.txt

RUN pip install -r ${TRANSFORMER_HOME}/requirements.txt

COPY src ${TRANSFORMER_HOME}/transformer/src

COPY uwsgi.ini ${TRANSFORMER_HOME}/transformer/uwsgi.ini

COPY entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

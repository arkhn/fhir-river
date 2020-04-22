FROM python:3.7-slim

ARG LOADER_HOME=/app
ENV PYTHONPATH=${LOADER_HOME}

WORKDIR ${LOADER_HOME}

COPY requirements.txt ${LOADER_HOME}/requirements.txt

RUN pip install -r ${LOADER_HOME}/requirements.txt

COPY /src ${LOADER_HOME}/loader/src

COPY /entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

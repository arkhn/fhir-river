FROM python:3.7-slim

ARG LOADER_HOME=/app
ENV PYTHONPATH=${LOADER_HOME}

WORKDIR ${LOADER_HOME}

COPY requirements.txt ${LOADER_HOME}/requirements.txt
COPY fhirstore-0.5.0.dev0-py3-none-any.whl ${LOADER_HOME}/fhirstore-0.5.0.dev0-py3-none-any.whl

RUN pip install -r ${LOADER_HOME}/requirements.txt

COPY /src ${LOADER_HOME}/loader/src

COPY /entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

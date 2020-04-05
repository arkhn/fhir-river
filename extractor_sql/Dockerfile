FROM python:3.7-slim

ARG EXTRACTOR_SQL_HOME=/app
ENV PYTHONPATH=${EXTRACTOR_SQL_HOME}

WORKDIR ${EXTRACTOR_SQL_HOME}

COPY requirements.txt ${EXTRACTOR_SQL_HOME}/requirements.txt

RUN pip install -r ${EXTRACTOR_SQL_HOME}/requirements.txt

COPY /src ${EXTRACTOR_SQL_HOME}/extractor_sql/src

COPY /entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

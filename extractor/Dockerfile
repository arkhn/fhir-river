FROM python:3.7-slim

RUN apt-get update \
    && apt-get -y install build-essential

RUN apt-get -y install libaio1 wget unzip

# Install the oracle client
RUN wget https://download.oracle.com/otn_software/linux/instantclient/195000/instantclient-basic-linux.x64-19.5.0.0.0dbru.zip
RUN unzip instantclient-basic-linux.x64-19.5.0.0.0dbru.zip -d /opt/oracle
ENV LD_LIBRARY_PATH="/opt/oracle/instantclient_19_5:${LD_LIBRARY_PATH}"
ENV PATH="/opt/oracle/instantclient_19_5:${PATH}"

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

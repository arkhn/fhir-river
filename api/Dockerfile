FROM python:3.7-slim

ARG API_HOME=/river
ENV PYTHONPATH=${API_HOME}

WORKDIR ${API_HOME}

COPY requirements.txt ${API_HOME}/requirements.txt

RUN pip install -r ${API_HOME}/requirements.txt

COPY src ${API_HOME}/api/src

COPY entrypoint.sh /entrypoint.sh

CMD ["sh", "/entrypoint.sh"]

FROM openjdk:8u162-jre

ENV REGISTRY_TAG v0.8.0rc3
ENV REGISTRY_VERSION 0.8.0

RUN apt-get update && \
    apt-get install -y gettext-base && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r hortonworks && useradd --no-log-init -r -g hortonworks hortonworks && \
    mkdir -p /opt/ && \
    wget -O /opt/hortonworks-registry-${REGISTRY_VERSION}.zip https://github.com/hortonworks/registry/releases/download/${REGISTRY_TAG}/hortonworks-registry-${REGISTRY_VERSION}.zip && \
    unzip /opt/hortonworks-registry-${REGISTRY_VERSION}.zip -d /opt && \
    chown -R hortonworks:hortonworks /opt/hortonworks-registry-${REGISTRY_VERSION} && \
    rm /opt/hortonworks-registry-${REGISTRY_VERSION}.zip && \
    ln -s /opt/hortonworks-registry-${REGISTRY_VERSION} /opt/hortonworks-registry

WORKDIR /opt/hortonworks-registry

COPY conf/registry.yaml.template /opt/hortonworks-registry/conf/registry.yaml.template
COPY entrypoint.sh /opt/hortonworks-registry/entrypoint.sh
COPY wait-for-it.sh /opt/hortonworks-registry/wait-for-it.sh

RUN chmod +x /opt/hortonworks-registry/entrypoint.sh && \
    chmod +x /opt/hortonworks-registry/wait-for-it.sh && \
    chown -R hortonworks:hortonworks /opt/hortonworks-registry-${REGISTRY_VERSION}

ENV DB_NAME schema_registry
ENV DB_USER registry_user
ENV DB_PASSWORD registry_password
ENV DB_HOST localhost
ENV DB_PORT 3306

EXPOSE 9090

USER hortonworks

ENTRYPOINT ["./entrypoint.sh"]

CMD ["./bin/registry-server-start.sh","./conf/registry.yaml"]


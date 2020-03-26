FROM openjdk:8-jre-alpine
WORKDIR /opt/docker
ADD --chown=daemon:daemon "target/docker/stage/opt" /opt
LABEL com.stuart.name="events-console-tools" \
      com.stuart.vcs-url="https://github.com/StuartApp/business-events"
USER daemon
ENTRYPOINT ["bin/console-tools"]

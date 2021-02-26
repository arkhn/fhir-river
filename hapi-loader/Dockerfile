FROM maven:3.6.3-openjdk-15-slim as builder

WORKDIR /app

COPY pom.xml .
RUN mvn -ntp dependency:go-offline

COPY src/ src/
RUN mvn clean package spring-boot:repackage -DskipTests

FROM gcr.io/distroless/java:11
COPY --from=builder /app/target /app
WORKDIR /app
CMD ["hapi-loader.jar"]
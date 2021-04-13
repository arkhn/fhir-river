package com.arkhn.hapi.loader;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;

import javax.annotation.PreDestroy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.elasticsearch.ElasticsearchContainer;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.jpa.api.dao.DaoRegistry;
import ca.uhn.fhir.jpa.api.dao.IFhirResourceDao;
import ca.uhn.fhir.jpa.api.model.DaoMethodOutcome;
import ca.uhn.fhir.parser.IParser;

@SpringBootTest(classes = ResourceConsumer.class)
@EmbeddedKafka(partitions = 1, brokerProperties = { "listeners=PLAINTEXT://localhost:9092", "port=9092" }, topics = {
        "${test.topic}" })
@ContextConfiguration(initializers = EmbeddedKafkaIntegrationTest.Initializer.class)
class EmbeddedKafkaIntegrationTest {

    private static ElasticsearchContainer embeddedElastic;
    private static PostgreSQLContainer<?> embeddedPostgres;
    static GenericContainer embeddedRedis;

    @Autowired
    DaoRegistry daoRegistry;

    @Autowired
    FhirContext myFhirContext;

    @Autowired
    private KafkaProducer producer;

    @Value("${test.topic}")
    private String topic;

    private static final String ELASTIC_VERSION = "7.10.1";
    private static final String ELASTIC_IMAGE = "docker.elastic.co/elasticsearch/elasticsearch:" + ELASTIC_VERSION;
    private static final String POSTGRES_IMAGE = "postgres:13";
    private static final String REDIS_IMAGE = "redis:5.0.7-alpine";
    private static final int REDIS_PORT = 6379;

    @BeforeAll
    public static void beforeClass() {
        embeddedPostgres = new PostgreSQLContainer<>(POSTGRES_IMAGE).withDatabaseName("test-hapi-db").withUsername("sa")
                .withPassword("sa");
        embeddedPostgres.start();

        embeddedElastic = new ElasticsearchContainer(ELASTIC_IMAGE)
                .withStartupTimeout(Duration.of(300, ChronoUnit.SECONDS));
        embeddedElastic.start();

        embeddedRedis = new GenericContainer(REDIS_IMAGE).withExposedPorts(REDIS_PORT);
        embeddedRedis.start();
        System.setProperty("spring.redis.host", embeddedRedis.getContainerIpAddress());
        System.setProperty("spring.redis.port", embeddedRedis.getMappedPort(REDIS_PORT).toString());
    }

    @PreDestroy
    public void stop() {
        embeddedPostgres.stop();
        embeddedElastic.stop();
        embeddedRedis.stop();
    }

    @Test
    public void loadNewResource() throws Exception {
        // create a patient
        Patient p = new Patient();
        p.setId("loadNewResource");
        p.setGender(AdministrativeGender.FEMALE);
        p.setName(Arrays.asList(new HumanName().addGiven("Julia")));

        // serialize it and send it to the loader
        IParser parser = myFhirContext.newJsonParser();
        JsonNode serialized = new ObjectMapper().readTree(parser.encodeResourceToString(p));
        KafkaMessage msg = new KafkaMessage();
        msg.setBatchId("batchId");
        msg.setResourceId("resourceId");
        msg.setFhirObject(serialized);

        // wait a bit (could use a refactor)
        producer.sendMessage(msg, topic);
        Thread.sleep(3000);

        // assert it has been created in the db
        IFhirResourceDao<Patient> dao = daoRegistry.getResourceDao("Patient");
        Patient result = dao.read(p.getIdElement());
        assertNotNull(result);
        assertEquals(AdministrativeGender.FEMALE, result.getGender());
        assertEquals("Julia", result.getName().get(0).getGiven().get(0).asStringValue());
    }

    @Test
    public void loadExistingResource() throws Exception {
        IFhirResourceDao<Patient> dao = daoRegistry.getResourceDao("Patient");

        // create initial patient
        Patient p = new Patient();
        p.setGender(AdministrativeGender.FEMALE);
        p.setName(Arrays.asList(new HumanName().addGiven("Julia")));
        DaoMethodOutcome outcome = dao.create(p);
        Patient created = (Patient) outcome.getResource();

        // modify it and send it to the loader
        created.getName().get(0).addGiven("Jude");
        created.setGender(AdministrativeGender.MALE);
        IParser parser = myFhirContext.newJsonParser();
        JsonNode serialized = new ObjectMapper().readTree(parser.encodeResourceToString(p));
        KafkaMessage msg = new KafkaMessage();
        msg.setBatchId("batchId");
        msg.setResourceId("resourceId");
        msg.setFhirObject(serialized);

        producer.sendMessage(msg, topic);

        // wait a bit (could use a refactor)
        Thread.sleep(3000);

        // assert it has been modified in the db
        // NB: make sure we remove the "version" part of the ID, otherwise a specific
        // version of the resource is read
        Patient result = dao.read(created.getIdElement().toVersionless());
        assertNotNull(result);
        assertEquals(AdministrativeGender.MALE, result.getGender());
        assertEquals("Julia", result.getName().get(0).getGiven().get(0).asStringValue());
        assertEquals("Jude", result.getName().get(0).getGiven().get(1).asStringValue());
    }

    static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        @Override
        public void initialize(ConfigurableApplicationContext configurableApplicationContext) {
            // Since the port is dynamically generated, replace the URL with one that has
            // the correct port
            TestPropertyValues
                    .of("elasticsearch.rest_url=" + embeddedElastic.getHost() + ":"
                            + embeddedElastic.getMappedPort(9200),
                            "spring.datasource.jdbcUrl=" + embeddedPostgres.getJdbcUrl(),
                            "spring.datasource.username=" + embeddedPostgres.getUsername(),
                            "spring.datasource.password=" + embeddedPostgres.getPassword(),
                            "spring.redis.host=" + embeddedRedis.getContainerIpAddress(),
                            "spring.redis.port=" + embeddedRedis.getMappedPort(REDIS_PORT).toString(),
                            "spring.redis.db_index=2",
                            "spring.datasource.driverClassName=org.postgresql.Driver")
                    .applyTo(configurableApplicationContext.getEnvironment());
        }

    }

}

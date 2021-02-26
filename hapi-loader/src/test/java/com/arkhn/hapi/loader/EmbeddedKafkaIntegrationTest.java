package com.arkhn.hapi.loader;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

import javax.annotation.PreDestroy;

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
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.elasticsearch.ElasticsearchContainer;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.jpa.api.dao.DaoRegistry;
import ca.uhn.fhir.jpa.api.dao.IFhirResourceDao;
import ca.uhn.fhir.jpa.api.model.DaoMethodOutcome;
import ca.uhn.fhir.parser.IParser;

import org.testcontainers.containers.PostgreSQLContainer;

import com.arkhn.hapi.loader.embedded.KafkaProducer;

@SpringBootTest(classes = ResourceConsumer.class)
@EmbeddedKafka(partitions = 1, brokerProperties = { "listeners=PLAINTEXT://localhost:9092", "port=9092" })
@ContextConfiguration(initializers = EmbeddedKafkaIntegrationTest.Initializer.class)
class EmbeddedKafkaIntegrationTest {

    private static ElasticsearchContainer embeddedElastic;
    private static PostgreSQLContainer<?> embeddedPostgres;

    @Autowired
    public KafkaTemplate<String, String> template;

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

    @BeforeAll
    public static void beforeClass() {
        embeddedPostgres = new PostgreSQLContainer<>(POSTGRES_IMAGE).withDatabaseName("test-hapi-db").withUsername("sa")
                .withPassword("sa");
        embeddedPostgres.start();

        embeddedElastic = new ElasticsearchContainer(ELASTIC_IMAGE)
                .withStartupTimeout(Duration.of(300, ChronoUnit.SECONDS));
        embeddedElastic.start();
    }

    @PreDestroy
    public void stop() {
        embeddedPostgres.stop();
        embeddedElastic.stop();
    }

    @Test
    public void loadNewResource() throws Exception {
        // create a patient
        Patient p = new Patient();
        p.setId("loadNewResource");
        p.setGender(AdministrativeGender.FEMALE);

        // serialize it and send it to the loader
        IParser parser = myFhirContext.newJsonParser();
        String serialized = parser.encodeResourceToString(p);
        producer.send(topic, serialized);

        // wait a bit (could use a refactor)
        Thread.sleep(3000);

        // assert it has been created in the db
        IFhirResourceDao<Patient> dao = daoRegistry.getResourceDao("Patient");
        Patient result = dao.read(p.getIdElement());
        assertNotNull(result);
    }

    @Test
    public void loadExistingResource() throws Exception {
        IFhirResourceDao<Patient> dao = daoRegistry.getResourceDao("Patient");

        // create initial patient
        Patient p = new Patient();
        p.setGender(AdministrativeGender.FEMALE);
        DaoMethodOutcome outcome = dao.create(p);
        Patient created = (Patient) outcome.getResource();

        // modify it and send it to the loader
        Patient updated = new Patient();
        updated.setId(created.getIdElement());
        updated.setGender(AdministrativeGender.MALE);

        IParser parser = myFhirContext.newJsonParser();
        String serialized = parser.encodeResourceToString(updated);
        producer.send(topic, serialized);

        // wait a bit (could use a refactor)
        Thread.sleep(3000);

        // assert it has been modified in the db
        // NB: make sure we remove the "version" part of the ID, otherwise a specific
        // version of the resource is read
        Patient result = dao.read(updated.getIdElement().toVersionless());
        assertNotNull(result);
        assertEquals(AdministrativeGender.MALE, result.getGender());
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
                            "spring.datasource.driverClassName=org.postgresql.Driver")
                    .applyTo(configurableApplicationContext.getEnvironment());
        }

    }

}

package com.arkhn.hapi.loader;

import ca.uhn.fhir.parser.DataFormatException;

import java.util.List;

import org.hl7.fhir.instance.model.api.IBaseBundle;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.jpa.api.dao.DaoRegistry;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.rest.client.api.IGenericClient;
import ca.uhn.fhir.util.BundleBuilder;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class ResourceConsumer extends SpringBootServletInitializer {

    public static void main(String[] args) {
        try {
            SpringApplication.run(ResourceConsumer.class, args);
        } catch (Exception e) {
            System.exit(1);
        }
    }

    @Bean
    public ResourceListener resourceListener(MeterRegistry registry) {
        return new ResourceListener(registry);
    }

    public static class ResourceListener {

        private static final Logger logger = LoggerFactory.getLogger(ResourceListener.class);

        @Autowired
        DaoRegistry daoRegistry;

        @Autowired
        FhirContext myFhirContext;

        private final Counter failedInsertions;
        private final Counter successfulInsertions;

        ResourceListener(MeterRegistry registry) {
            failedInsertions = registry.counter("count_failed_insertions");
            successfulInsertions = registry.counter("count_successful_insertions");
        }

        @KafkaListener(id = "resource-loader", topicPattern = "${hapi.loader.kafka.topicPattern}", containerFactory = "kafkaListenerContainerFactory", autoStartup = "true", concurrency = "${hapi.loader.concurrency}")
        public void listen(List<KafkaMessage> messages) {
            BundleBuilder builder = new BundleBuilder(myFhirContext);
            IParser parser = myFhirContext.newJsonParser();
            logger.info(String.format("poll batch size: %s", messages.size()));

            for (KafkaMessage message : messages) {
                try {
                    IBaseResource resource;
                    resource = parser.parseResource(message.getFhirObject().toString());
                    builder.addTransactionUpdateEntry(resource);
                } catch (DataFormatException e) {
                    logger.error(String.format("Could not parse resource: %s", e));
                    failedInsertions.increment();
                }
            }

            try {
                logger.info(String.format("BUNDLE: %s", builder.getBundle()));

                IGenericClient fhirClient = myFhirContext.newRestfulGenericClient("http://hapi-fhir:8080/fhir");
                // Execute the transaction
                // TODO check outcome
                IBaseBundle outcome = fhirClient.transaction().withBundle(builder.getBundle()).execute();
                successfulInsertions.increment(1000);
            } catch (Exception e) {
                logger.error(String.format("Could not insert resource: %s", e));
                failedInsertions.increment();
            }
        }
    }
}

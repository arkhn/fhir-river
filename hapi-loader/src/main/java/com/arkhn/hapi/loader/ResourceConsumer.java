package com.arkhn.hapi.loader;

import ca.uhn.fhir.parser.DataFormatException;
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
import ca.uhn.fhir.jpa.api.dao.IFhirResourceDao;
import ca.uhn.fhir.parser.IParser;

import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    @KafkaListener(id = "resource-loader", topicPattern = "${hapi.loader.kafka.topicPattern}", containerFactory = "kafkaListenerContainerFactory", autoStartup = "true", concurrency = "${hapi.loader.concurrency}")
    public static class ResourceListener {

        private static final Logger logger = LoggerFactory.getLogger(ResourceListener.class);

        @Autowired
        DaoRegistry daoRegistry;

        @Autowired
        FhirContext myFhirContext;

        @Autowired

        private Counter failedInsertions;
        private Counter successfulInsertions;

        ResourceListener(MeterRegistry registry) {
            failedInsertions = registry.counter("count_failed_insertions");
            successfulInsertions = registry.counter("count_successful_insertions");
        }

        @KafkaHandler
        @Timed(value = "time_load")
        public void listen(KafkaMessage message) {

            IParser parser = myFhirContext.newJsonParser();
            IBaseResource resource;
            try {
                resource = parser.parseResource(message.getFhirObject().toString());
            } catch (ca.uhn.fhir.parser.DataFormatException e) {
                logger.error(String.format("Could not parse resource: %s", e));
                failedInsertions.increment();
                return;
            }

            @SuppressWarnings("unchecked")
            IFhirResourceDao<IBaseResource> dao = daoRegistry.getResourceDao(resource.getClass().getSimpleName());

            try {
                // TODO how does the following method tells us that something wrong happened
                dao.update(resource);
                successfulInsertions.increment();
            } catch (Exception e) {
                logger.error(String.format("Could not insert resource: %s", e));
                failedInsertions.increment();
                return;
            }
        }
    }
}

package com.arkhn.hapi.loader;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.hl7.fhir.instance.model.api.IBaseResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.AliasFor;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.transaction.support.TransactionCallback;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.interceptor.api.Pointcut;
import ca.uhn.fhir.jpa.api.config.DaoConfig;
import ca.uhn.fhir.jpa.api.dao.DaoRegistry;
import ca.uhn.fhir.jpa.api.dao.IFhirResourceDao;
import ca.uhn.fhir.jpa.api.dao.IFhirSystemDao;
import ca.uhn.fhir.jpa.dao.tx.HapiTransactionService;
import ca.uhn.fhir.jpa.provider.IJpaSystemProvider;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.rest.api.server.storage.TransactionDetails;
import ca.uhn.fhir.rest.server.exceptions.InvalidRequestException;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;
import ca.uhn.fhir.rest.server.provider.ResourceProviderFactory;

@SpringBootApplication
public class KafkaApplication {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(KafkaApplication.class, args);
    }

    @Bean
    public MessageListener messageListener() {
        return new MessageListener();
    }

    @KafkaListener(id = "loader", topics = "${message.topic.name}", containerFactory = "kafkaListenerContainerFactory", autoStartup = "true", concurrency = "4")
    public static class MessageListener {

        @Autowired
        DaoRegistry daoRegistry;

        @Autowired
        FhirContext myFhirContext;

        @Autowired
        private HapiTransactionService myHapiTransactionService;

        private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

        @KafkaHandler
        public void listen(String message) {
            System.out.println("Received Message in group 'loader': " + message);
            IParser parser = myFhirContext.newJsonParser();
            BufferedReader reader;
            Stream<String> lines;
            List<IBaseResource> resources;
            try {
                reader = new BufferedReader(new FileReader(message));
                lines = reader.lines().filter(Objects::nonNull);
                resources = lines.map(line -> parser.parseResource(line)).collect(Collectors.toList());
            } catch (FileNotFoundException e) {
                log.error(e.getMessage());
                return;
            }

            long start = System.currentTimeMillis();
            final AtomicInteger total = new AtomicInteger(0);

            /* TRANSACTION STUFF */
            final TransactionDetails transactionDetails = new TransactionDetails();
            transactionDetails.beginAcceptingDeferredInterceptorBroadcasts(Pointcut.STORAGE_PRECOMMIT_RESOURCE_CREATED,
                    Pointcut.STORAGE_PRECOMMIT_RESOURCE_UPDATED, Pointcut.STORAGE_PRECOMMIT_RESOURCE_DELETED);

            @SuppressWarnings("unchecked")
            TransactionCallback<Object> txCallback = status -> {
                resources.forEach(r -> {
                    IFhirResourceDao<IBaseResource> dao = daoRegistry.getResourceDao(r.getClass().getSimpleName());
                    try {
                        dao.update(r);
                    } catch (ResourceNotFoundException e) {
                        log.debug(e.getMessage());
                    } catch (InvalidRequestException e) {
                        log.warn(e.getMessage());
                    } catch (Exception e) {
                        log.warn("GENERIC" + e.getMessage());
                    }
                    total.incrementAndGet();
                });
                return null;
            };

            log.info("Begin transaction with {} resources", resources.size());
            myHapiTransactionService.execute(null, txCallback);
            long took = System.currentTimeMillis() - start;
            log.info("Inserted {} resources. Took {}ms", resources.size(), took);

            try {
                reader.close();
            } catch (IOException e) {
                log.error(e.getMessage());
                return;
            }
        }
    }
}
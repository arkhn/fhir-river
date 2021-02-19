package com.arkhn.hapi.loader;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.hl7.fhir.instance.model.api.IBaseResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.transaction.support.TransactionCallback;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.interceptor.api.Pointcut;
import ca.uhn.fhir.jpa.api.dao.DaoRegistry;
import ca.uhn.fhir.jpa.api.dao.IFhirResourceDao;
import ca.uhn.fhir.jpa.dao.tx.HapiTransactionService;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.rest.api.server.storage.TransactionDetails;
import ca.uhn.fhir.rest.server.exceptions.InvalidRequestException;
import ca.uhn.fhir.rest.server.exceptions.ResourceNotFoundException;

@SpringBootApplication
public class ResourceConsumer {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(ResourceConsumer.class, args);
    }

    @Bean
    public ResourceListener resourceListener() {
        return new ResourceListener();
    }

    @KafkaListener(id = "resource-loader", topics = "${message.topic.name}", containerFactory = "kafkaListenerContainerFactory", autoStartup = "true", concurrency = "8")
    public static class ResourceListener {

        @Autowired
        DaoRegistry daoRegistry;

        @Autowired
        FhirContext myFhirContext;

        @Autowired
        private HapiTransactionService myHapiTransactionService;

        private List<IBaseResource> bufferedResources;

        public ResourceListener() {
            this.bufferedResources = Collections.synchronizedList(new ArrayList<>());
        }

        @KafkaHandler
        public void listen(String message) {

            IParser parser = myFhirContext.newJsonParser();
            IBaseResource r = parser.parseResource(message);
            bufferedResources.add(r);

            if (bufferedResources.size() >= 100) {

                // create a copy of the buffer and empty the thread-safe object
                ArrayList<IBaseResource> tmp;
                synchronized (bufferedResources) {
                    tmp = new ArrayList<>(bufferedResources);
                    bufferedResources.clear();
                }

                // send the transaction
                TxExecutor txExecutor = new TxExecutor(daoRegistry, myHapiTransactionService, tmp);
                Thread t = new Thread(txExecutor);
                t.start();
            }

        }

        public class TxExecutor implements Runnable {
            @Autowired
            DaoRegistry daoRegistry;

            @Autowired
            private HapiTransactionService txService;

            private final Logger log = LoggerFactory.getLogger(ResourceListener.class);

            private List<IBaseResource> buffer;

            public TxExecutor(DaoRegistry daoRegistry, HapiTransactionService txService, List<IBaseResource> buffer) {
                this.daoRegistry = daoRegistry;
                this.txService = txService;
                this.buffer = buffer;
            }

            public void run() {
                long start = System.currentTimeMillis();
                final TransactionDetails transactionDetails = new TransactionDetails();
                transactionDetails.beginAcceptingDeferredInterceptorBroadcasts(
                        Pointcut.STORAGE_PRECOMMIT_RESOURCE_CREATED, Pointcut.STORAGE_PRECOMMIT_RESOURCE_UPDATED,
                        Pointcut.STORAGE_PRECOMMIT_RESOURCE_DELETED);

                @SuppressWarnings("unchecked")
                TransactionCallback<Object> txCallback = status -> {
                    buffer.forEach(r -> {
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
                    });
                    return null;
                };

                log.info("Begin transaction with {} resources", buffer.size());
                txService.execute(null, txCallback);
                long took = System.currentTimeMillis() - start;
                log.info("Inserted {} resources. Took {}ms", buffer.size(), took);

            }
        }

    }
}
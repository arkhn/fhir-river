package com.arkhn.hapi.loader;

import org.hl7.fhir.instance.model.api.IBaseResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.jpa.api.dao.DaoRegistry;
import ca.uhn.fhir.jpa.api.dao.IFhirResourceDao;
import ca.uhn.fhir.parser.IParser;

@SpringBootApplication
public class ResourceConsumer {

    public static void main(String[] args) throws Exception {
        try {
            SpringApplication.run(ResourceConsumer.class, args);
        } catch (Exception e) {
            System.exit(1);
        }
    }

    @Bean
    public ResourceListener resourceListener() {
        return new ResourceListener();
    }

    @KafkaListener(id = "resource-loader", topics = "${hapi.loader.kafka.topic}", containerFactory = "kafkaListenerContainerFactory", autoStartup = "true", concurrency = "${hapi.loader.concurrency}")
    public static class ResourceListener {

        @Autowired
        DaoRegistry daoRegistry;

        @Autowired
        FhirContext myFhirContext;

        @KafkaHandler
        public void listen(String message) {
            IParser parser = myFhirContext.newJsonParser();
            IBaseResource r = parser.parseResource(message);

            @SuppressWarnings("unchecked")
            IFhirResourceDao<IBaseResource> dao = daoRegistry.getResourceDao(r.getClass().getSimpleName());

            dao.update(r);

            // TODO: error handling

            // TODO: produce "load" events

            // // THE FOLLOWING CODE IS THE "BATCH UPDATE" VERSION
            // // I CHOSE TO DISABLE THIS FOR NOW BECAUSE IT SEEMS TO BE LESS EFFICIENT
            // private List<IBaseResource> bufferedResources;
            // this.bufferedResources = Collections.synchronizedList(new ArrayList<>());
            // bufferedResources.add(r);
            // if (bufferedResources.size() >= 100) {

            // // create a copy of the buffer and empty the thread-safe object
            // ArrayList<IBaseResource> tmp;
            // synchronized (bufferedResources) {
            // tmp = new ArrayList<>(bufferedResources);
            // bufferedResources.clear();
            // }

            // // send the transaction
            // TransactionExecutor txExecutor = new TransactionExecutor(daoRegistry,
            // myHapiTransactionService, tmp);
            // // threadPool.submit(txExecutor);
            // threadPool.execute(txExecutor);
            // }

        }

    }
}
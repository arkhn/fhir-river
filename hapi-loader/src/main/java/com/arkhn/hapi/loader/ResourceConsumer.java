package com.arkhn.hapi.loader;

import org.codehaus.jettison.json.JSONObject;
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
import io.prometheus.client.Histogram;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    @KafkaListener(id = "resource-loader", topicPattern = "${hapi.loader.kafka.topicPattern}", containerFactory = "kafkaListenerContainerFactory", autoStartup = "true", concurrency = "${hapi.loader.concurrency}")
    public static class ResourceListener {

        private Logger logger = LoggerFactory.getLogger(ResourceListener.class);

        @Autowired
        DaoRegistry daoRegistry;

        @Autowired
        FhirContext myFhirContext;

        @Autowired
        private KafkaProducer producer;

        static final Histogram loadMetrics = Histogram.build().name("time_load").help("time to perform load")
                .register();

        @KafkaHandler
        public void listen(String message) {
            String fhirObject;
            String batchId;
            try {
                // TODO I think we could find a better way to do that. With classes? With kafka?
                JSONObject jsonObject = new JSONObject(message);
                fhirObject = jsonObject.getString("fhir_object");
                batchId = jsonObject.getString("batch_id");
            } catch (Exception e) {
                logger.info(String.format("Could not process message: %s", e.toString()));
                return;
            }

            IParser parser = myFhirContext.newJsonParser();
            IBaseResource r = parser.parseResource(fhirObject);

            @SuppressWarnings("unchecked")
            IFhirResourceDao<IBaseResource> dao = daoRegistry.getResourceDao(r.getClass().getSimpleName());

            Histogram.Timer loadTimer = loadMetrics.startTimer();
            try {
                dao.update(r);
            } finally {
                loadTimer.observeDuration();
            }

            producer.sendMessage(batchId, String.format("load.%s", batchId));
            // TODO: error handling

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
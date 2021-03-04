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
import io.prometheus.client.Counter;
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

        private static final Logger logger = LoggerFactory.getLogger(ResourceListener.class);

        @Autowired
        DaoRegistry daoRegistry;

        @Autowired
        FhirContext myFhirContext;

        @Autowired
        private KafkaProducer producer;

        static final Histogram loadMetrics = Histogram.build().name("time_load").help("Time to perform load.")
                .register();
        static final Counter failedInsertions = Counter.build().name("count_failed_insertions")
                .help("Number of failed insertions.").register();
        static final Counter successfulInsertions = Counter.build().name("count_successful_insertions")
                .help("Number of successful insertions.").register();

        @KafkaHandler
        public void listen(String message) {
            String fhirObject;
            String batchId;
            try {
                // TODO I think we could find a better way to do that. With classes? With kafka?
                logger.info(String.format("Received message: %s", message));

                JSONObject jsonObject = new JSONObject(message);
                fhirObject = jsonObject.getString("fhir_object");
                batchId = jsonObject.getString("batch_id");
            } catch (Exception e) {
                logger.error(String.format("Could not process message: %s", e.toString()));
                failedInsertions.inc();
                return;
            }

            IParser parser = myFhirContext.newJsonParser();
            IBaseResource r = parser.parseResource(fhirObject);

            @SuppressWarnings("unchecked")
            IFhirResourceDao<IBaseResource> dao = daoRegistry.getResourceDao(r.getClass().getSimpleName());

            Histogram.Timer loadTimer = loadMetrics.startTimer();
            try {
                // TODO how does the following method tells us that something wrong happened
                logger.info(String.format("Inserting for %s...", batchId));
                dao.update(r);
                successfulInsertions.inc();
            } catch (Exception e) {
                logger.error(String.format("Could not insert resource: %s", e.toString()));
                failedInsertions.inc();
                return;
            } finally {
                loadTimer.observeDuration();
            }

            KafkaMessage loadMessage = new KafkaMessage();
            loadMessage.setBatchId(batchId);
            logger.info(String.format("Sending kafka event for %s...", batchId));
            producer.sendMessage(loadMessage, String.format("load.%s", batchId));
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

        // @KafkaHandler
        // public void listen(KafkaMessage message) {
        // IParser parser = myFhirContext.newJsonParser();
        // IBaseResource r = parser.parseResource(message.getFhirObject());

        // @SuppressWarnings("unchecked")
        // IFhirResourceDao<IBaseResource> dao =
        // daoRegistry.getResourceDao(r.getClass().getSimpleName());

        // Histogram.Timer loadTimer = loadMetrics.startTimer();
        // try {
        // // TODO how does the following method tells us that something wrong happened
        // dao.update(r);
        // successfulInsertions.inc();
        // } catch (Exception e) {
        // logger.error(String.format("Could not insert resource: %s", e.toString()));
        // failedInsertions.inc();
        // } finally {
        // loadTimer.observeDuration();
        // }

        // KafkaMessage loadMessage = new KafkaMessage();
        // loadMessage.setBatchId(message.getBatchId());
        // producer.sendMessage(loadMessage, String.format("load.%s",
        // message.getBatchId()));
        // // TODO: error handling

        // // // THE FOLLOWING CODE IS THE "BATCH UPDATE" VERSION
        // // // I CHOSE TO DISABLE THIS FOR NOW BECAUSE IT SEEMS TO BE LESS EFFICIENT
        // // private List<IBaseResource> bufferedResources;
        // // this.bufferedResources = Collections.synchronizedList(new ArrayList<>());
        // // bufferedResources.add(r);
        // // if (bufferedResources.size() >= 100) {

        // // // create a copy of the buffer and empty the thread-safe object
        // // ArrayList<IBaseResource> tmp;
        // // synchronized (bufferedResources) {
        // // tmp = new ArrayList<>(bufferedResources);
        // // bufferedResources.clear();
        // // }

        // // // send the transaction
        // // TransactionExecutor txExecutor = new TransactionExecutor(daoRegistry,
        // // myHapiTransactionService, tmp);
        // // // threadPool.submit(txExecutor);
        // // threadPool.execute(txExecutor);
        // // }

        // }

    }
}
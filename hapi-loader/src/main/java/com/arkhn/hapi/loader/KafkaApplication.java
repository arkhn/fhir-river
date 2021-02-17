package com.arkhn.hapi.loader;

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

        private static final Logger log = LoggerFactory.getLogger(MessageListener.class);

        @KafkaHandler
        public void listen(String message) {
            System.out.println("Received Message in group 'loader': " + message);
        }
    }
}
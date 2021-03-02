package com.arkhn.hapi.loader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class KafkaProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(KafkaProducer.class);

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    KafkaProducer(KafkaTemplate<String, String> kafkaTemplate) {
      this.kafkaTemplate = kafkaTemplate;
    }

    void sendMessage(String message, String topicName) {
        LOGGER.info("sending payload='{}' to topic='{}'", message, topicName);
        kafkaTemplate.send(topicName, message);
    }
}
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
  private KafkaTemplate<String, KafkaMessage> kafkaTemplate;

  KafkaProducer(KafkaTemplate<String, KafkaMessage> kafkaTemplate) {
    this.kafkaTemplate = kafkaTemplate;
  }

  void sendMessage(KafkaMessage message, String topicName) {

    LOGGER.debug("sending payload='{}' to topic='{}'", message, topicName);
    kafkaTemplate.send(topicName, message);
  }
}
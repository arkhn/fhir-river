package com.arkhn.hapi.loader;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.kafka.common.serialization.Deserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MessageDeserializer implements Deserializer<KafkaMessage> {

    private static final Logger logger = LoggerFactory.getLogger(MessageDeserializer.class);

    @Override
    public KafkaMessage deserialize(String topic, byte[] bytes) {

        logger.debug(bytes.toString());

        ObjectMapper mapper = new ObjectMapper();
        KafkaMessage message = null;
        try {
            message = mapper.readValue(bytes, KafkaMessage.class);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return message;
    }

}
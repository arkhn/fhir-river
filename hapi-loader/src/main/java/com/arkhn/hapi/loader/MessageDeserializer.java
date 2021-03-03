package com.arkhn.hapi.loader;

import java.util.Arrays;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.kafka.common.serialization.Deserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MessageDeserializer implements Deserializer<KafkaMessage> {

    private static final Logger logger = LoggerFactory.getLogger(MessageDeserializer.class);

    @Override
    public KafkaMessage deserialize(String s, byte[] bytes) {
        ObjectMapper mapper = new ObjectMapper();
        KafkaMessage message = null;
        try {
            message = mapper.readValue(bytes, KafkaMessage.class);
        } catch (Exception e) {
            logger.error(Arrays.toString(e.getStackTrace()));
        }
        return message;
    }

}
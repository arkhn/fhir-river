package com.arkhn.hapi.loader;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.kafka.common.serialization.Serializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MessageSerializer implements Serializer<KafkaMessage> {

    private static final Logger logger = LoggerFactory.getLogger(MessageSerializer.class);

    @Override
    public byte[] serialize(String s, KafkaMessage message) {
        byte[] retVal = null;
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            retVal = objectMapper.writeValueAsString(message).getBytes();
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return retVal;
    }

}
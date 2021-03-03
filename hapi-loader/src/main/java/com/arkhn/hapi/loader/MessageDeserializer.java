package com.arkhn.hapi.loader;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.kafka.common.serialization.Deserializer;

public class MessageDeserializer implements Deserializer<KafkaMessage> {

    @Override
    public KafkaMessage deserialize(String s, byte[] bytes) {
        ObjectMapper mapper = new ObjectMapper();
        KafkaMessage message = null;
        try {
            message = mapper.readValue(bytes, KafkaMessage.class);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return message;
    }

}
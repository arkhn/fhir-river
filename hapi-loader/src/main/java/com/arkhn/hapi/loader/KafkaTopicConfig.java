package com.arkhn.hapi.loader;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

@Configuration
public class KafkaTopicConfig {

    @Value(value = "${hapi.loader.kafka.bootstrapAddress}")
    private String bootstrapAddress;

    @Value(value = "${hapi.loader.kafka.topic}")
    private String topicName;

    @Value(value = "${hapi.loader.kafka.replicationFactor}")
    private short replicationFactor;

    @Value(value = "${hapi.loader.concurrency}")
    private Integer partitions;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        return new KafkaAdmin(configs);
    }

    @Bean
    public NewTopic topic() {
        return new NewTopic(topicName, partitions, replicationFactor);
    }
}

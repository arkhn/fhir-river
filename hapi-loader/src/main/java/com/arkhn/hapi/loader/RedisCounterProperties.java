package com.arkhn.hapi.loader;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "spring.redis")
@Configuration
@EnableConfigurationProperties
public class RedisCounterProperties {

    private String host = "river-redis";
    private Integer port = 6379;
    private Integer db_index = 2;

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public Integer getDb_index() {
        return db_index;
    }

    public void setDb_index(Integer db_index) {
        this.db_index = db_index;
    }
}
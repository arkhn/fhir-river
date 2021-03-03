package com.arkhn.hapi.loader;

import com.fasterxml.jackson.annotation.JsonProperty;

public class KafkaMessage {
    @JsonProperty("batch_id")
    private String batchId;

    @JsonProperty("resource_id")
    private String resourceId;

    @JsonProperty("fhir_object")
    private String fhirObject;

    public String getBatchId() {
        return batchId;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getFhirObject() {
        return fhirObject;
    }
}
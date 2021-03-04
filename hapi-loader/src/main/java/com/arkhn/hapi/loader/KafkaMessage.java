package com.arkhn.hapi.loader;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

public class KafkaMessage {
    @JsonProperty("batch_id")
    private String batchId;

    @JsonProperty("resource_id")
    private String resourceId;

    @JsonProperty("fhir_object")
    private JsonNode fhirObject;

    public String getBatchId() {
        return batchId;
    }

    public String getResourceId() {
        return resourceId;
    }

    public JsonNode getFhirObject() {
        return fhirObject;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public void setFhirObject(JsonNode fhirObject) {
        this.fhirObject = fhirObject;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }
}
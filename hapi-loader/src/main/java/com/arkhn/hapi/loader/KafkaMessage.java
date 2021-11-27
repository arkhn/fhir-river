package com.arkhn.hapi.loader;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


@JsonIgnoreProperties(ignoreUnknown = true)
class After {
    @JsonProperty("fhir")
    private JsonNode fhir;

    @JsonProperty("fhir")
    public JsonNode getFhir() {
        return fhir;
    }

    @JsonProperty("fhir")
    public void setFhir(String fhir) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        this.fhir = mapper.readTree(fhir);
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
class Payload {
    @JsonProperty("after")
    private After after;

    @JsonProperty("after")
    public After getAfter() {
        return after;
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
public class KafkaMessage {

    @JsonProperty("payload")
    private Payload payload;

    public JsonNode getFhirObject() {
        return this.payload.getAfter().getFhir();
    }

    public void setFhirObject(JsonNode resource) throws JsonProcessingException {
        this.payload.getAfter().setFhir(resource.toString());
    }
}

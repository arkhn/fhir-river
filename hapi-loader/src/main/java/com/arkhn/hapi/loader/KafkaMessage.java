package com.arkhn.hapi.loader;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

// @JsonInclude(JsonInclude.Include.NON_EMPTY)
// public class FhirResource extends JsonNode {

// }

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class KafkaMessage {

    private JsonNode fhirObject;

    @SuppressWarnings("unchecked")
    @JsonProperty("payload")
    private void unpackNested(Map<String, Object> payload) {
        Map<String, Object> after = (Map<String, Object>) payload.get("after");
        String content = (String) after.get("fhir");
        try {
            this.fhirObject = new ObjectMapper().readValue(content, JsonNode.class);
        } catch (Exception e) {
            return;
        }
    }

    public JsonNode getFhirObject() {
        return fhirObject;
    }

    public void setFhirObject(JsonNode fhirObject) {
        this.fhirObject = fhirObject;
    }

}

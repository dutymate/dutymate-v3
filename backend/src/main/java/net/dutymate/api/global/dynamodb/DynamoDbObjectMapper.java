package net.dutymate.api.global.dynamodb;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class DynamoDbObjectMapper {

	private final ObjectMapper mapper;

	public DynamoDbObjectMapper(ObjectMapper mapper) {
		this.mapper = mapper;
	}

	public <T> T readValue(String payload, Class<T> type) {
		try {
			return mapper.readValue(payload, type);
		} catch (JsonProcessingException e) {
			throw new IllegalStateException("Failed to deserialize DynamoDB payload", e);
		}
	}

	public String writeValueAsString(Object value) {
		try {
			return mapper.writeValueAsString(value);
		} catch (JsonProcessingException e) {
			throw new IllegalStateException("Failed to serialize DynamoDB payload", e);
		}
	}
}

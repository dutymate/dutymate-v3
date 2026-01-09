package net.dutymate.api.global.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import net.dutymate.api.global.dynamodb.DynamoDbObjectMapper;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClientBuilder;

@Configuration
public class DynamoDbConfig {

	@Value("${cloud.aws.credentials.access-key}")
	private String accessKey;

	@Value("${cloud.aws.credentials.secret-key}")
	private String secretKey;

	@Value("${cloud.aws.region.static}")
	private String region;

	@Value("${cloud.aws.dynamodb.endpoint:}")
	private String dynamoEndpoint;

	@Bean
	public DynamoDbClient dynamoDbClient() {
		AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
		DynamoDbClientBuilder builder = DynamoDbClient.builder()
			.region(Region.of(region))
			.credentialsProvider(StaticCredentialsProvider.create(awsCredentials));

		if (dynamoEndpoint != null && !dynamoEndpoint.isBlank()) {
			builder.endpointOverride(URI.create(dynamoEndpoint));
		}

		return builder.build();
	}

	@Bean
	public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
		return DynamoDbEnhancedClient.builder()
			.dynamoDbClient(dynamoDbClient)
			.build();
	}

	@Bean
	public DynamoDbObjectMapper dynamoDbObjectMapper() {
		ObjectMapper mapper = new ObjectMapper();
		mapper.registerModule(new JavaTimeModule());
		mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
		mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		mapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);
		mapper.setVisibility(PropertyAccessor.GETTER, JsonAutoDetect.Visibility.NONE);
		mapper.setVisibility(PropertyAccessor.IS_GETTER, JsonAutoDetect.Visibility.NONE);
		return new DynamoDbObjectMapper(mapper);
	}
}

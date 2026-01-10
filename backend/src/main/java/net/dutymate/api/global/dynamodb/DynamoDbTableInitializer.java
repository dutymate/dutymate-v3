package net.dutymate.api.global.dynamodb;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeDefinition;
import software.amazon.awssdk.services.dynamodb.model.BillingMode;
import software.amazon.awssdk.services.dynamodb.model.CreateTableRequest;
import software.amazon.awssdk.services.dynamodb.model.DescribeTableRequest;
import software.amazon.awssdk.services.dynamodb.model.KeySchemaElement;
import software.amazon.awssdk.services.dynamodb.model.KeyType;
import software.amazon.awssdk.services.dynamodb.model.ResourceNotFoundException;
import software.amazon.awssdk.services.dynamodb.model.ScalarAttributeType;

@Slf4j
@Component
@RequiredArgsConstructor
public class DynamoDbTableInitializer implements ApplicationRunner {

	private final DynamoDbClient dynamoDbClient;

	@Value("${dynamodb.auto-create:true}")
	private boolean autoCreate;

	@Value("${dynamodb.tables.ward-schedules}")
	private String wardSchedulesTable;

	@Value("${dynamodb.tables.member-schedules}")
	private String memberSchedulesTable;

	@Value("${dynamodb.tables.news}")
	private String newsTable;

	@Override
	public void run(ApplicationArguments args) {
		if (!autoCreate) {
			log.info("DynamoDB table auto-create is disabled.");
			return;
		}

		createTableIfMissing(wardSchedulesTable,
			List.of(
				AttributeDefinition.builder().attributeName("wardId").attributeType(ScalarAttributeType.N).build(),
				AttributeDefinition.builder().attributeName("yearMonth").attributeType(ScalarAttributeType.S).build()
			),
			List.of(
				KeySchemaElement.builder().attributeName("wardId").keyType(KeyType.HASH).build(),
				KeySchemaElement.builder().attributeName("yearMonth").keyType(KeyType.RANGE).build()
			)
		);

		createTableIfMissing(memberSchedulesTable,
			List.of(
				AttributeDefinition.builder().attributeName("memberId").attributeType(ScalarAttributeType.N).build(),
				AttributeDefinition.builder().attributeName("yearMonth").attributeType(ScalarAttributeType.S).build()
			),
			List.of(
				KeySchemaElement.builder().attributeName("memberId").keyType(KeyType.HASH).build(),
				KeySchemaElement.builder().attributeName("yearMonth").keyType(KeyType.RANGE).build()
			)
		);

		createTableIfMissing(newsTable,
			List.of(
				AttributeDefinition.builder().attributeName("pk").attributeType(ScalarAttributeType.S).build(),
				AttributeDefinition.builder().attributeName("createdAt").attributeType(ScalarAttributeType.S).build()
			),
			List.of(
				KeySchemaElement.builder().attributeName("pk").keyType(KeyType.HASH).build(),
				KeySchemaElement.builder().attributeName("createdAt").keyType(KeyType.RANGE).build()
			)
		);
	}

	private void createTableIfMissing(String tableName, List<AttributeDefinition> attributes,
		List<KeySchemaElement> keySchema) {
		if (tableName == null || tableName.isBlank()) {
			throw new IllegalStateException("DynamoDB table name is not configured.");
		}

		try {
			dynamoDbClient.describeTable(DescribeTableRequest.builder().tableName(tableName).build());
			log.info("DynamoDB table '{}' already exists.", tableName);
			return;
		} catch (ResourceNotFoundException ex) {
			log.info("DynamoDB table '{}' not found. Creating...", tableName);
		}

		dynamoDbClient.createTable(CreateTableRequest.builder()
			.tableName(tableName)
			.attributeDefinitions(attributes)
			.keySchema(keySchema)
			.billingMode(BillingMode.PAY_PER_REQUEST)
			.build());

		dynamoDbClient.waiter().waitUntilTableExists(DescribeTableRequest.builder().tableName(tableName).build());
		log.info("DynamoDB table '{}' created.", tableName);
	}
}

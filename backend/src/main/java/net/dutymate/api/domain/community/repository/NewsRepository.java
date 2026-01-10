package net.dutymate.api.domain.community.repository;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import net.dutymate.api.domain.community.collections.News;
import net.dutymate.api.global.dynamodb.DynamoDbObjectMapper;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;

@Repository
@RequiredArgsConstructor
public class NewsRepository {

	private static final String PARTITION_KEY = "news";
	private static final DateTimeFormatter SORT_KEY_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

	private final DynamoDbEnhancedClient dynamoDbEnhancedClient;
	private final DynamoDbObjectMapper dynamoDbObjectMapper;

	@Value("${dynamodb.tables.news}")
	private String tableName;

	public long count() {
		QueryConditional query = QueryConditional.keyEqualTo(Key.builder().partitionValue(PARTITION_KEY).build());
		return dynamoTable().query(query)
			.stream()
			.mapToLong(page -> page.items().size())
			.sum();
	}

	public News findFirstByOrderByCreatedAtDesc() {
		QueryConditional query = QueryConditional.keyEqualTo(Key.builder().partitionValue(PARTITION_KEY).build());
		QueryEnhancedRequest request = QueryEnhancedRequest.builder()
			.queryConditional(query)
			.limit(1)
			.scanIndexForward(false)
			.build();
		return dynamoTable().query(request).items().stream()
			.findFirst()
			.map(this::toDomain)
			.orElse(null);
	}

	public News save(News news) {
		if (news == null || news.getCreatedAt() == null) {
			throw new IllegalArgumentException("news and createdAt must be set");
		}
		NewsRecord record = new NewsRecord();
		record.setPk(PARTITION_KEY);
		record.setCreatedAt(news.getCreatedAt().format(SORT_KEY_FORMATTER));
		record.setPayload(serialize(news));
		dynamoTable().putItem(record);
		return news;
	}

	private DynamoDbTable<NewsRecord> dynamoTable() {
		return dynamoDbEnhancedClient.table(tableName, TableSchema.fromBean(NewsRecord.class));
	}

	private News toDomain(NewsRecord record) {
		return dynamoDbObjectMapper.readValue(record.getPayload(), News.class);
	}

	private String serialize(News news) {
		return dynamoDbObjectMapper.writeValueAsString(news);
	}

	@DynamoDbBean
	public static class NewsRecord {
		private String pk;
		private String createdAt;
		private String payload;

		@DynamoDbPartitionKey
		public String getPk() {
			return pk;
		}

		public void setPk(String pk) {
			this.pk = pk;
		}

		@DynamoDbSortKey
		public String getCreatedAt() {
			return createdAt;
		}

		public void setCreatedAt(String createdAt) {
			this.createdAt = createdAt;
		}

		public String getPayload() {
			return payload;
		}

		public void setPayload(String payload) {
			this.payload = payload;
		}
	}
}

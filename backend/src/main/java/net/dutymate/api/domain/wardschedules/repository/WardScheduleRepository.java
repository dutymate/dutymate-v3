package net.dutymate.api.domain.wardschedules.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import net.dutymate.api.domain.wardschedules.collections.WardSchedule;
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

@Repository
@RequiredArgsConstructor
public class WardScheduleRepository {

	private static final String YEAR_MONTH_PATTERN = "%04d-%02d";

	private final DynamoDbEnhancedClient dynamoDbEnhancedClient;
	private final DynamoDbObjectMapper dynamoDbObjectMapper;

	@Value("${dynamodb.tables.ward-schedules}")
	private String tableName;

	public Optional<WardSchedule> findByWardIdAndYearAndMonth(Long wardId, int year, int month) {
		Key key = Key.builder()
			.partitionValue(wardId)
			.sortValue(toYearMonthKey(year, month))
			.build();
		WardScheduleRecord record = dynamoTable().getItem(r -> r.key(key));
		if (record == null) {
			return Optional.empty();
		}
		return Optional.of(toDomain(record));
	}

	public List<WardSchedule> findAllByWardId(Long wardId) {
		QueryConditional query = QueryConditional.keyEqualTo(Key.builder().partitionValue(wardId).build());
		return dynamoTable().query(query).items().stream()
			.map(this::toDomain)
			.toList();
	}

	public WardSchedule save(WardSchedule schedule) {
		if (schedule == null) {
			return null;
		}
		schedule.setIdIfNotExist(buildId(schedule.getWardId(), schedule.getYear(), schedule.getMonth()));
		WardScheduleRecord record = new WardScheduleRecord();
		record.setWardId(schedule.getWardId());
		record.setYearMonth(toYearMonthKey(schedule.getYear(), schedule.getMonth()));
		record.setPayload(serialize(schedule));
		dynamoTable().putItem(record);
		return schedule;
	}

	public List<WardSchedule> saveAll(List<WardSchedule> schedules) {
		if (schedules == null || schedules.isEmpty()) {
			return List.of();
		}
		List<WardSchedule> saved = new ArrayList<>(schedules.size());
		for (WardSchedule schedule : schedules) {
			saved.add(save(schedule));
		}
		return saved;
	}

	public void deleteByWardId(Long wardId) {
		QueryConditional query = QueryConditional.keyEqualTo(Key.builder().partitionValue(wardId).build());
		DynamoDbTable<WardScheduleRecord> table = dynamoTable();
		for (WardScheduleRecord record : table.query(query).items()) {
			table.deleteItem(record);
		}
	}

	public void deleteByWardIdIn(List<Long> wardIds) {
		if (wardIds == null || wardIds.isEmpty()) {
			return;
		}
		for (Long wardId : wardIds) {
			deleteByWardId(wardId);
		}
	}

	private DynamoDbTable<WardScheduleRecord> dynamoTable() {
		return dynamoDbEnhancedClient.table(tableName, TableSchema.fromBean(WardScheduleRecord.class));
	}

	private WardSchedule toDomain(WardScheduleRecord record) {
		WardSchedule schedule = dynamoDbObjectMapper.readValue(record.getPayload(), WardSchedule.class);
		schedule.setIdIfNotExist(buildId(record.getWardId(), schedule.getYear(), schedule.getMonth()));
		return schedule;
	}

	private String serialize(WardSchedule schedule) {
		return dynamoDbObjectMapper.writeValueAsString(schedule);
	}

	private String toYearMonthKey(int year, int month) {
		return String.format(YEAR_MONTH_PATTERN, year, month);
	}

	private String buildId(Long wardId, int year, int month) {
		return new StringBuilder()
			.append(wardId)
			.append("-")
			.append(toYearMonthKey(year, month))
			.toString();
	}

	@DynamoDbBean
	public static class WardScheduleRecord {
		private Long wardId;
		private String yearMonth;
		private String payload;

		@DynamoDbPartitionKey
		public Long getWardId() {
			return wardId;
		}

		public void setWardId(Long wardId) {
			this.wardId = wardId;
		}

		@DynamoDbSortKey
		public String getYearMonth() {
			return yearMonth;
		}

		public void setYearMonth(String yearMonth) {
			this.yearMonth = yearMonth;
		}

		public String getPayload() {
			return payload;
		}

		public void setPayload(String payload) {
			this.payload = payload;
		}
	}
}

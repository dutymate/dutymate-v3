package net.dutymate.api.domain.wardschedules.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import net.dutymate.api.domain.wardschedules.collections.MemberSchedule;
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
import software.amazon.awssdk.enhanced.dynamodb.model.ReadBatch;

@Repository
@RequiredArgsConstructor
public class MemberScheduleRepository {

	private static final String YEAR_MONTH_PATTERN = "%04d-%02d";
	private static final int BATCH_GET_LIMIT = 100;

	private final DynamoDbEnhancedClient dynamoDbEnhancedClient;
	private final DynamoDbObjectMapper dynamoDbObjectMapper;

	@Value("${dynamodb.tables.member-schedules}")
	private String tableName;

	public Optional<MemberSchedule> findByMemberIdAndYearAndMonth(Long memberId, int year, int month) {
		Key key = Key.builder()
			.partitionValue(memberId)
			.sortValue(toYearMonthKey(year, month))
			.build();
		MemberScheduleRecord record = dynamoTable().getItem(r -> r.key(key));
		if (record == null) {
			return Optional.empty();
		}
		return Optional.of(toDomain(record));
	}

	public void deleteByMemberId(Long memberId) {
		QueryConditional query = QueryConditional.keyEqualTo(Key.builder().partitionValue(memberId).build());
		DynamoDbTable<MemberScheduleRecord> table = dynamoTable();
		for (MemberScheduleRecord record : table.query(query).items()) {
			table.deleteItem(record);
		}
	}

	public List<MemberSchedule> findAllByMemberIdInAndYearAndMonth(List<Long> memberIds, int year, int month) {
		if (memberIds == null || memberIds.isEmpty()) {
			return List.of();
		}
		String yearMonth = toYearMonthKey(year, month);
		List<MemberSchedule> results = new ArrayList<>();
		DynamoDbTable<MemberScheduleRecord> table = dynamoTable();

		for (int start = 0; start < memberIds.size(); start += BATCH_GET_LIMIT) {
			int end = Math.min(start + BATCH_GET_LIMIT, memberIds.size());
			List<Long> batch = memberIds.subList(start, end);

			ReadBatch.Builder<MemberScheduleRecord> readBatchBuilder = ReadBatch.builder(MemberScheduleRecord.class)
				.mappedTableResource(table);

			for (Long memberId : batch) {
				readBatchBuilder.addGetItem(Key.builder()
					.partitionValue(memberId)
					.sortValue(yearMonth)
					.build());
			}

			dynamoDbEnhancedClient.batchGetItem(r -> r.addReadBatch(readBatchBuilder.build()))
				.resultsForTable(table)
				.forEach(record -> results.add(toDomain(record)));
		}

		return results;
	}

	public MemberSchedule save(MemberSchedule schedule) {
		if (schedule == null) {
			return null;
		}
		MemberScheduleRecord record = new MemberScheduleRecord();
		record.setMemberId(schedule.getMemberId());
		record.setYearMonth(toYearMonthKey(schedule.getYear(), schedule.getMonth()));
		record.setPayload(serialize(schedule));
		dynamoTable().putItem(record);
		return schedule;
	}

	public List<MemberSchedule> saveAll(List<MemberSchedule> schedules) {
		if (schedules == null || schedules.isEmpty()) {
			return List.of();
		}
		List<MemberSchedule> saved = new ArrayList<>(schedules.size());
		for (MemberSchedule schedule : schedules) {
			saved.add(save(schedule));
		}
		return saved;
	}

	private DynamoDbTable<MemberScheduleRecord> dynamoTable() {
		return dynamoDbEnhancedClient.table(tableName, TableSchema.fromBean(MemberScheduleRecord.class));
	}

	private MemberSchedule toDomain(MemberScheduleRecord record) {
		return dynamoDbObjectMapper.readValue(record.getPayload(), MemberSchedule.class);
	}

	private String serialize(MemberSchedule schedule) {
		return dynamoDbObjectMapper.writeValueAsString(schedule);
	}

	private String toYearMonthKey(int year, int month) {
		return String.format(YEAR_MONTH_PATTERN, year, month);
	}

	@DynamoDbBean
	public static class MemberScheduleRecord {
		private Long memberId;
		private String yearMonth;
		private String payload;

		@DynamoDbPartitionKey
		public Long getMemberId() {
			return memberId;
		}

		public void setMemberId(Long memberId) {
			this.memberId = memberId;
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

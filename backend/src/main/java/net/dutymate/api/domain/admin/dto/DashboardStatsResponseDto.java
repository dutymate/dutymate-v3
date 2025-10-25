package net.dutymate.api.domain.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponseDto {

	private long totalUsers;
	private long totalWards;
	private long yesterdayLoginCount;
}

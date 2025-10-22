package net.dutymate.api.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserGrowthResponseDto {
	private Long currentTotalUsers;
	private Long oneWeekAgoTotalUsers;
	private Long yesterdayTotalUsers;
	private Long dailyGrowth;
	private Long weeklyGrowth;
	private Double growthRate;
	private String message;
}

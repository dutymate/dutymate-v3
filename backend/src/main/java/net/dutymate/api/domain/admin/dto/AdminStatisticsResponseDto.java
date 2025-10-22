package net.dutymate.api.domain.admin.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatisticsResponseDto {
	private Long totalMembers;
	private Long totalWards;
	private Long totalNurses;
	private Long totalHeadNurses;
	private Long totalActiveMembers;
	private Long totalAutoScheduleGenerated;
	private List<MemberStatDto> recentMembers;
	private List<WardStatDto> wardStats;

	// 페이지네이션 정보
	private int currentPage;
	private int totalPages;
	private long totalElements;

	@Getter
	@Builder
	public static class MemberStatDto {
		private Long memberId;
		private String email;
		private String name;
		private String role;
		private Integer autoGenCnt;
		private String createdAt;
		private String lastLoginAt;
		private String wardName;
	}

	@Getter
	@Builder
	public static class WardStatDto {
		private Long wardId;
		private String wardName;
		private String hospitalName;
		private Long nurseCount;
		private Long headNurseCount;
	}
}

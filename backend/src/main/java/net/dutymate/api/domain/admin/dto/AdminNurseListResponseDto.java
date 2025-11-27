package net.dutymate.api.domain.admin.dto;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;

import net.dutymate.api.domain.member.Gender;
import net.dutymate.api.domain.member.Member;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminNurseListResponseDto {

	private List<NurseSummary> nurses;
	private long totalElements;
	private int currentPage;
	private int totalPages;

	public static AdminNurseListResponseDto of(Page<Member> memberPage, Map<Long, Long> groupCountMap) {
		List<NurseSummary> nurseList = memberPage.getContent().stream()
			.map(member -> NurseSummary.builder()
				.profileImg(member.getProfileImg())
				.name(member.getName())
				.createdAt(member.getCreatedAt())
				.gender(member.getGender())
				.totalAutoGenCnt(member.getTotalAutoGenCnt())
				.autoGenCnt(member.getAutoGenCnt())
				.myGroupCnt(groupCountMap.getOrDefault(member.getMemberId(), 0L))
				.wardName(member.getWardMember() != null
					&&					member.getWardMember().getWard() != null
					?					member.getWardMember().getWard().getWardName() : null)
				.lastLoginAt(null)  // TODO
				.build())
			.collect(Collectors.toList());

		return AdminNurseListResponseDto.builder()
			.nurses(nurseList)
			.totalElements(memberPage.getTotalElements())
			.currentPage(memberPage.getNumber())
			.totalPages(memberPage.getTotalPages())
			.build();
	}

	@Data
	@Builder
	public static class NurseSummary {
		private String profileImg;
		private String name;
		private Timestamp createdAt;
		private Gender gender;
		private Integer totalAutoGenCnt;
		private Long myGroupCnt;
		private String wardName;
		private Timestamp lastLoginAt;
		private Integer autoGenCnt;
	}
}

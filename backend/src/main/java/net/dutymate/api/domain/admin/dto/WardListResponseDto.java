package net.dutymate.api.domain.admin.dto;

import java.util.List;

import org.springframework.data.domain.Page;

import net.dutymate.api.domain.ward.Ward;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WardListResponseDto {

	private List<WardSummary> wards;
	private long totalElements;
	private int currentPage;
	private int totalPages;

	public static WardListResponseDto of(Page<Ward> wardPage) {
		List<WardSummary> wardSummaries = wardPage.getContent().stream()
			.map(WardSummary::of)
			.toList();

		return WardListResponseDto.builder()
			.wards(wardSummaries)
			.totalElements(wardPage.getTotalElements())
			.currentPage(wardPage.getNumber())
			.totalPages(wardPage.getTotalPages())
			.build();
	}

	@Data
	@Builder
	public static class WardSummary {

		private Long wardId;
		private String wardCode;
		private String wardName;
		private String hospitalName;
		private Integer nursesCount;
		private Integer maxNurseCount;
		private Integer maxTempNurseCount;

		public static WardSummary of(Ward ward) {
			return WardSummary.builder()
				.wardId(ward.getWardId())
				.wardCode(ward.getWardCode())
				.wardName(ward.getWardName())
				.hospitalName(ward.getHospitalName())
				.nursesCount(ward.getWardMemberList() != null ? ward.getWardMemberList().size() : 0)
				.maxNurseCount(ward.getMaxNurseCount())
				.maxTempNurseCount(ward.getMaxTempNurseCount())
				.build();
		}
	}
}

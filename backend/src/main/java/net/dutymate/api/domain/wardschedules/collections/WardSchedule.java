package net.dutymate.api.domain.wardschedules.collections;

import java.util.List;

import net.dutymate.api.domain.common.utils.YearMonth;

import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.jackson.Jacksonized;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WardSchedule {

	@Id
	private String id;

	private Long wardId;
	private int year;
	private int month;

	@Setter
	private List<Long> nurseOrder;

	private int nowIdx;

	// 듀티표 리스트
	@Setter
	private List<Duty> duties;

	public void setNowIdx(Integer nowIdx) {
		this.nowIdx = nowIdx;
	}

	public void setIdIfNotExist(String id) {
		if (this.id == null) {
			this.id = id;
		}
	}

	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	@AllArgsConstructor(access = AccessLevel.PRIVATE)
	@Builder
	public static class Duty {
		private int idx;
		private List<NurseShift> duty;
		private History history;

		public void addNurseShift(NurseShift nurseShift) {
			this.duty.add(nurseShift);
		}
	}

	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	@AllArgsConstructor(access = AccessLevel.PRIVATE)
	@Builder
	public static class NurseShift {
		@Setter
		private Long memberId;
		private String shifts;

		public void changeShifts(String shifts) {
			this.shifts = shifts;
		}
	}

	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	@AllArgsConstructor(access = AccessLevel.PUBLIC)
	@Builder
	@Jacksonized // Lombok의 @Builder와 JSON 직렬화 간의 충돌을 방지
	public static class History {

		@Setter
		private Long memberId;

		private String name;
		private String before;
		private String after;

		private Integer modifiedDay;
		private Boolean isAutoCreated;
	}

	public YearMonth getYearMonth() {
		return new YearMonth(this.year, this.month);
	}
}

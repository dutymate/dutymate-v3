package net.dutymate.api.domain.wardschedules.dto;

import java.util.List;

import net.dutymate.api.domain.autoschedule.Shift;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TodayDutyResponseDto {

	private Shift myShift;
	private List<GradeNameShift> otherShifts;

	public static TodayDutyResponseDto of(char shift, List<GradeNameShift> otherShifts) {
		return TodayDutyResponseDto.builder()
			.myShift(Shift.valueOf(String.valueOf(shift)))
			.otherShifts(otherShifts)
			.build();
	}

	@Data
	@Builder
	public static class GradeNameShift {

		private Integer grade;
		private String name;
		private Shift shift;

		public static GradeNameShift of(Integer grade, String name, char shift) {
			return GradeNameShift.builder()
				.grade(grade)
				.name(name)
				.shift(Shift.valueOf(String.valueOf(shift)))
				.build();
		}
	}
}

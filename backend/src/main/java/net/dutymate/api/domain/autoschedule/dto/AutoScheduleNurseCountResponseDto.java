package net.dutymate.api.domain.autoschedule.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AutoScheduleNurseCountResponseDto {
	private int neededNurseCount;

	public AutoScheduleNurseCountResponseDto(int neededNurseCount) {
		this.neededNurseCount = neededNurseCount;
	}
}

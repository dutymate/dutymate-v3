package net.dutymate.api.domain.wardmember.dto;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NurseInfoRequestDto {

	private Integer shiftFlags;
	private String skillLevel;
	@Size(max = 200, message = "메모는 최대 200자입니다.")
	private String memo;
	private String role;
	private String workIntensity;

}

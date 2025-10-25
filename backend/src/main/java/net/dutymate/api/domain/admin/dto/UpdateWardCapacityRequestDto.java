package net.dutymate.api.domain.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateWardCapacityRequestDto {

	@NotNull(message = "최대 간호사 수는 필수입니다.")
	@Min(value = 1, message = "최대 간호사 수는 1명 이상이어야 합니다.")
	private Integer maxNurseCount;

	@NotNull(message = "최대 임시 간호사 수는 필수입니다.")
	@Min(value = 0, message = "최대 임시 간호사 수는 0명 이상이어야 합니다.")
	private Integer maxTempNurseCount;
}

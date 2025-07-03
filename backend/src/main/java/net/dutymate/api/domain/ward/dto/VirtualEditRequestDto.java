package net.dutymate.api.domain.ward.dto;

import net.dutymate.api.domain.member.Gender;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VirtualEditRequestDto {

	@Size(max = 20, message = "이름은 최대 20자입니다.")
	private String name;
	private Gender gender;
	private Integer grade;
}

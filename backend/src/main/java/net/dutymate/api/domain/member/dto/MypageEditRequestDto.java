package net.dutymate.api.domain.member.dto;

import net.dutymate.api.global.auth.annotation.NamePolicy;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MypageEditRequestDto {

	@Size(max = 20, message = "이름은 최대 20자입니다.")
	@NamePolicy
	private String name;
	@Size(max = 20, message = "닉네임은 최대 20자입니다.")
	@NamePolicy
	private String nickname;
	private String gender;
	private Integer grade;
}

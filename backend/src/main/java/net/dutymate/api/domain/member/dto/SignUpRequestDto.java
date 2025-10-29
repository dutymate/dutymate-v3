package net.dutymate.api.domain.member.dto;

import org.mindrot.jbcrypt.BCrypt;

import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.member.Provider;
import net.dutymate.api.global.auth.annotation.NamePolicy;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SignUpRequestDto {

	// 이메일: 형식 + 길이 + 도메인 블랙리스트
	@Size(max = 45, message = "이메일은 최대 45자입니다.")
	@Email(message = "이메일 형식이 아닙니다.")
	@Pattern(
		regexp = "^(?!.*@dutymate\\.demo$).+$",
		message = "@dutymate.demo 도메인은 사용할 수 없습니다."
	)
	private String email;

	// 비밀번호: 8+ / 영문1+ / 숫자1+ / 특수문자1+
	@NotBlank(message = "비밀번호를 입력해 주세요.")
	@Pattern(
		regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$#^!%*~?&])[A-Za-z\\d@$#^!%*~?&]{8,}$",
		message = "비밀번호는 8자 이상, 영문/숫자/특수문자(@$#^!%*~?&)를 포함해야 합니다."
	)
	private String password;

	@NotBlank(message = "비밀번호 확인을 입력해 주세요.")
	private String passwordConfirm;

	// 이름: 선택값(빈 문자열 허용) + 길이 + (입력 시) 패턴/금지어 검사 → 커스텀 제약 사용
	@Size(max = 20, message = "이름은 최대 20자입니다.")
	@NamePolicy // ← 커스텀 제약 (아래 2) 참조)
	private String name;

	private Integer autoGenCnt;

	// cross-field 유효성 (비밀번호=비밀번호확인)
	@AssertTrue(message = "비밀번호와 비밀번호 확인이 일치하지 않습니다.")
	public boolean isPasswordConfirmed() {
		if (password == null || passwordConfirm == null) {
			return false;
		}
		return password.equals(passwordConfirm);
	}

	public Member toMember(String defaultProfileImg) {
		return Member.builder()
			.email(email)
			.password(BCrypt.hashpw(password, BCrypt.gensalt()))
			.name(name)
			.provider(Provider.NONE)
			.profileImg(defaultProfileImg)
			.autoGenCnt(autoGenCnt)
			.build();
	}

	public LoginRequestDto toLoginRequestDto() {
		return LoginRequestDto.builder()
			.email(email)
			.password(password)
			.build();
	}
}

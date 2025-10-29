package net.dutymate.api.global.validation;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import net.dutymate.api.global.auth.annotation.NamePolicy;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NamePolicyValidator implements ConstraintValidator<NamePolicy, String> {

	// 프런트 동기화: 한글(완성형+자모) + 영문 + 숫자 + 공백만
	private static final String NAME_REGEX = "^[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9 ]*$";

	// 금지어 목록 (소문자 비교)
	private static final Set<String> FORBIDDEN = Stream.of(
		// 서비스 관련
		"dutymate", "duty", "mate", "듀티메이트", "듀티", "메이트",
		// 관리자/시스템 관련
		"admin", "administrator", "system", "owner", "master", "root", "manager",
		"staff", "support", "help", "관리자", "어드민", "시스템", "운영자", "매니저",
		// 직위 관련
		"수간호사", "간호부장", "간호과장", "간호사", "간호팀장", "병원장",
		// 신뢰성 관련
		"official", "test", "tester", "guest", "공식", "테스트", "게스트",
		// 추가 요구했던 일반 금지어
		"name", "nickname", "이름", "닉네임"
	).map(s -> s.toLowerCase()).collect(Collectors.toSet());

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		// 1) 빈 문자열 허용 (선택 입력)
		if (value == null || value.trim().isEmpty()) {
			return true;
		}

		final String trimmed = value.trim();

		// 2) 허용 문자셋 체크 (숫자/공백 허용, 특수문자 불가)
		if (!trimmed.matches(NAME_REGEX)) {
			context.disableDefaultConstraintViolation();
			context.buildConstraintViolationWithTemplate("이름은 한글, 영문, 숫자, 공백만 입력해 주세요.")
				.addConstraintViolation();
			return false;
		}

		// 3) 금지어(완전일치, 대소문자 무시)
		if (FORBIDDEN.contains(trimmed.toLowerCase())) {
			context.disableDefaultConstraintViolation();
			context.buildConstraintViolationWithTemplate("사용할 수 없는 이름입니다.")
				.addConstraintViolation();
			return false;
		}

		return true;
	}
}

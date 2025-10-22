package net.dutymate.api.global.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import net.dutymate.api.domain.member.Member;

import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class AdminCheckAspect {

	private static final String ADMIN_EMAIL = "dutymate.net@gmail.com";

	@Before("@annotation(net.dutymate.api.global.auth.annotation.AdminOnly)")
	public void checkAdminPermission(JoinPoint joinPoint) {
		// Controller 메서드의 파라미터에서 Member 찾기 (@Auth Member member)
		Object[] args = joinPoint.getArgs();
		Member member = null;

		for (Object arg : args) {
			if (arg instanceof Member) {
				member = (Member)arg;
				break;
			}
		}

		if (member == null) {
			log.warn("AdminOnly 어노테이션이 적용된 메서드에 Member 파라미터가 없습니다.");
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증이 필요합니다.");
		}

		if (!ADMIN_EMAIL.equals(member.getEmail())) {
			log.warn("관리자 권한 없는 사용자의 접근 시도: {}", member.getEmail());
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
		}

		log.info("관리자 권한 확인 완료: {}", member.getEmail());
	}
}

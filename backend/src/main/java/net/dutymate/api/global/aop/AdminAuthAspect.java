package net.dutymate.api.global.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import net.dutymate.api.domain.member.Member;

@Aspect
@Component
public class AdminAuthAspect {

	@Value("${admin.email}")
	private String adminEmail;

	@Around("@annotation(net.dutymate.api.global.auth.annotation.AdminOnly)")
	public Object checkAdminAuth(ProceedingJoinPoint joinPoint) throws Throwable {
		Object[] args = joinPoint.getArgs();

		Member member = null;
		for (Object arg : args) {
			if (arg instanceof Member) {
				member = (Member)arg;
				break;
			}
		}

		if (member == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다.");
		}

		if (!adminEmail.equals(member.getEmail())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
		}

		return joinPoint.proceed();
	}
}

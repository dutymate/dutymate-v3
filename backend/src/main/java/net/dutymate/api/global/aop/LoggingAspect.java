package net.dutymate.api.global.aop;

import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

	private static final String LOG_TYPE_REQUEST = "REQUEST";
	private static final String LOG_TYPE_RESPONSE = "RESPONSE";
	private static final int NANO_TO_MILLI = 1_000_000;
	private static final int MAX_RETURN_VALUE_LENGTH = 200;

	@Pointcut("execution(* net.dutymate.api..controller..*(..))")
	private void cut() {

	}

	@Around("cut()")
	public Object aroundLog(final ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
		final Method method = getMethod(proceedingJoinPoint);
		final String methodName = method.getName();
		final String className = method.getDeclaringClass().getSimpleName();
		final HttpServletRequest request = getCurrentHttpRequest();

		String httpMethod = null;
		String requestUri = null;
		String queryString = null;
		String clientIp = null;
		String userAgent = null;

		if (request != null) {
			httpMethod = request.getMethod();
			requestUri = request.getRequestURI();
			String rawQueryString = request.getQueryString();
			if (rawQueryString != null) {
				queryString = URLDecoder.decode(rawQueryString, StandardCharsets.UTF_8);
			}
			clientIp = getClientIp(request);
			userAgent = request.getHeader("User-Agent");
		}

		logRequest(className, methodName, httpMethod, requestUri, queryString, clientIp, userAgent);

		final long startTime = System.nanoTime();
		Object returnObj;
		try {
			returnObj = proceedingJoinPoint.proceed();
			final long endTime = System.nanoTime();
			final long executionTime = (endTime - startTime) / NANO_TO_MILLI;
			logResponse(className, methodName, executionTime, returnObj, null);
			return returnObj;
		} catch (Throwable throwable) {
			final long endTime = System.nanoTime();
			final long executionTime = (endTime - startTime) / NANO_TO_MILLI;
			logResponse(className, methodName, executionTime, null, throwable);
			throw throwable;
		}
	}

	private Method getMethod(final ProceedingJoinPoint proceedingJoinPoint) {
		final MethodSignature signature = (MethodSignature)proceedingJoinPoint.getSignature();
		return signature.getMethod();
	}

	private HttpServletRequest getCurrentHttpRequest() {
		final ServletRequestAttributes attr = (ServletRequestAttributes)RequestContextHolder.getRequestAttributes();
		if (attr != null) {
			return attr.getRequest();
		}
		return null;
	}

	private String getClientIp(HttpServletRequest request) {
		if (request == null) {
			return null;
		}
		String ip = request.getHeader("X-Forwarded-For");
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("Proxy-Client-IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("WL-Proxy-Client-IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr();
		}
		if (ip != null && ip.contains(",")) {
			ip = ip.split(",")[0].trim();
		}
		return ip;
	}

	private void logRequest(String className, String methodName, String httpMethod, String requestUri,
		String queryString, String clientIp, String userAgent) {
		StringBuilder logMessage = new StringBuilder();
		logMessage.append("type=").append(LOG_TYPE_REQUEST);
		logMessage.append(" class=").append(className);
		logMessage.append(" method=").append(methodName);

		if (httpMethod != null) {
			logMessage.append(" httpMethod=").append(httpMethod);
		}
		if (requestUri != null) {
			logMessage.append(" path=").append(requestUri);
		}
		if (queryString != null && !queryString.isEmpty()) {
			logMessage.append(" query=").append(queryString);
		}
		if (clientIp != null) {
			logMessage.append(" clientIp=").append(clientIp);
		}
		if (userAgent != null) {
			String truncatedUserAgent = userAgent.length() > 100
				? userAgent.substring(0, 100) + "..."
				: userAgent;
			logMessage.append(" userAgent=").append(truncatedUserAgent);
		}

		log.info(logMessage.toString());
	}

	private void logResponse(String className, String methodName, long executionTime, Object returnObj,
		Throwable throwable) {
		StringBuilder logMessage = new StringBuilder();
		logMessage.append("type=").append(LOG_TYPE_RESPONSE);
		logMessage.append(" class=").append(className);
		logMessage.append(" method=").append(methodName);
		logMessage.append(" duration=").append(executionTime).append("ms");

		if (throwable != null) {
			logMessage.append(" status=ERROR");
			logMessage.append(" error=").append(throwable.getClass().getSimpleName());
			logMessage.append(" errorMessage=").append(throwable.getMessage());
			log.error(logMessage.toString(), throwable);
		} else {
			logMessage.append(" status=SUCCESS");
			if (returnObj != null) {
				String returnType = returnObj.getClass().getSimpleName();
				logMessage.append(" returnType=").append(returnType);
				String returnSummary = getReturnValueSummary(returnObj);
				if (!returnSummary.isEmpty()) {
					logMessage.append(" returnValue=").append(returnSummary);
				}
			} else {
				logMessage.append(" returnType=void");
			}
			log.info(logMessage.toString());
		}
	}

	private String getReturnValueSummary(Object returnObj) {
		if (returnObj == null) {
			return "";
		}

		if (returnObj instanceof java.util.Collection) {
			java.util.Collection<?> collection = (java.util.Collection<?>)returnObj;
			return String.format("Collection[%s,size=%d]", returnObj.getClass().getSimpleName(), collection.size());
		}

		if (returnObj.getClass().isArray()) {
			return String.format("Array[%s,length=%d]", returnObj.getClass().getComponentType().getSimpleName(),
				java.lang.reflect.Array.getLength(returnObj));
		}

		if (returnObj instanceof java.util.Map) {
			java.util.Map<?, ?> map = (java.util.Map<?, ?>)returnObj;
			return String.format("Map[%s,size=%d]", returnObj.getClass().getSimpleName(), map.size());
		}

		String toString = returnObj.toString();
		if (toString.length() > MAX_RETURN_VALUE_LENGTH) {
			return toString.substring(0, MAX_RETURN_VALUE_LENGTH) + "...(truncated)";
		}

		return toString;
	}
}

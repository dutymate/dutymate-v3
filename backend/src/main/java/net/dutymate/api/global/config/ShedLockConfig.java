package net.dutymate.api.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import net.javacrumbs.shedlock.provider.redis.spring.RedisLockProvider;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;

@Configuration
@EnableSchedulerLock(defaultLockAtMostFor = "5m")
public class ShedLockConfig {

	private static final String REDIS_KEY_PREFIX = "dutymate";

	@Bean
	public RedisLockProvider lockProvider(RedisConnectionFactory redisConnectionFactory) {
		return new RedisLockProvider(redisConnectionFactory, REDIS_KEY_PREFIX);
	}

}

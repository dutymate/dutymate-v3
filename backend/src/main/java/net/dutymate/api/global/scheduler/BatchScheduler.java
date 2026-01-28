package net.dutymate.api.global.scheduler;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import net.dutymate.api.domain.community.service.NewsService;
import net.dutymate.api.domain.holiday.service.HolidayService;
import net.dutymate.api.domain.member.service.LoginLogService;
import net.dutymate.api.domain.member.service.MemberService;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class BatchScheduler {

	private final MemberService memberService;
	private final LoginLogService loginLogService;
	private final HolidayService holidayService;
	private final NewsService newsService;

	/**
	 * 데모 회원 삭제
	 * 실행 주기: 매시간 정각 (KST)
	 */
	@Scheduled(cron = "0 0 * * * *")
	@SchedulerLock(
		name = "deleteDemoMembers",
		lockAtMostFor = "5m",
		lockAtLeastFor = "1m"
	)
	public void deleteDemoMembers() {
		try {
			log.info("[Scheduler] Delete demo members started");
			memberService.deleteDemoMember();
		} catch (Exception e) {
			log.error("[Scheduler] Failed to delete demo members", e);
		}
	}

	/**
	 * 전체 회원의 자동 생성 카운트 증가
	 * 실행 주기: 매월 1일 0시 (KST)
	 */
	@Scheduled(cron = "0 0 0 1 * ?")
	@SchedulerLock(
		name = "increaseAutoGenCount",
		lockAtMostFor = "5m",
		lockAtLeastFor = "1m"
	)
	public void increaseAutoGenCount() {
		try {
			log.info("[Scheduler] Increase auto gen count started");
			memberService.increaseAutoGenCntAll();
		} catch (Exception e) {
			log.error("[Scheduler] Failed to increase auto-gen count", e);
		}
	}

	/**
	 * 로그인 로그를 S3에 배치 저장
	 * 실행 주기: 매일 0시 5분 (KST)
	 */
	@Scheduled(cron = "0 5 0 * * *")
	@SchedulerLock(
		name = "batchLoginLogs",
		lockAtMostFor = "5m",
		lockAtLeastFor = "1m"
	)
	public void batchLoginLogs() {
		try {
			log.info("[Scheduler] Batch login logs started");
			loginLogService.batchLoginLogs();
		} catch (Exception e) {
			log.error("[Scheduler] Failed to batch login logs", e);
		}
	}

	/**
	 * 공휴일 정보 업데이트
	 * 실행 주기: 매일 0시 10분 (KST)
	 */
	@Scheduled(cron = "0 10 0 * * *")
	@SchedulerLock(
		name = "updateHolidays",
		lockAtMostFor = "10m",
		lockAtLeastFor = "5m"
	)
	public void updateHolidays() {
		try {
			log.info("[Scheduler] Update holidays started");
			final int currentYear = LocalDate.now().getYear();
			holidayService.updateYearHolidays(currentYear);
			holidayService.updateYearHolidays(currentYear + 1);
			log.info("[Scheduler] Holiday update completed for years {} and {}",
				currentYear, currentYear + 1);
		} catch (Exception e) {
			log.error("[Scheduler] Failed to update holidays", e);
		}
	}

	/**
	 * 최신 뉴스 갱신
	 * 실행 주기: 매일 6시, 14시, 21시(KST)
	 */
	@Scheduled(cron = "0 0 6,14,21 * * *")
	@SchedulerLock(
		name = "refreshNews",
		lockAtMostFor = "5m",
		lockAtLeastFor = "1m"
	)
	public void refreshNews() {
		try {
			log.info("[Scheduler] Refresh News started");
			newsService.refreshRecentNews();
		} catch (Exception e) {
			log.error("[Scheduler] Failed to refresh news", e);
		}
	}

}

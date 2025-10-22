package net.dutymate.api.domain.admin.service;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import net.dutymate.api.domain.admin.dto.AdminStatisticsResponseDto;
import net.dutymate.api.domain.admin.dto.UserGrowthResponseDto;
import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.member.repository.MemberRepository;
import net.dutymate.api.domain.ward.Ward;
import net.dutymate.api.domain.ward.repository.WardRepository;
import net.dutymate.api.domain.wardmember.Role;
import net.dutymate.api.domain.wardmember.repository.WardMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

	private static final String ADMIN_EMAIL = "dutymate.net@gmail.com";
	private static final String TEMP_NURSE_EMAIL = "tempEmail@temp.com";
	private final MemberRepository memberRepository;
	private final WardRepository wardRepository;
	private final WardMemberRepository wardMemberRepository;

	@Transactional(readOnly = true)
	public AdminStatisticsResponseDto getAdminStatistics(Member member, int page, int size) {
		// 관리자 권한 확인
		if (!ADMIN_EMAIL.equals(member.getEmail())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
		}

		// 전체 통계 - 각각 한 방 쿼리
		long totalMembers = memberRepository.count();
		long totalWards = wardRepository.count();
		long totalNurses = wardMemberRepository.countByMemberRole(Role.RN);
		long totalHeadNurses = wardMemberRepository.countByMemberRole(Role.HN);
		long totalActiveMembers = memberRepository.countByIsActiveTrue();

		// 전체 자동생성 사용 횟수 합계 - 한 방 쿼리 (findAll() 제거!)
		long totalAutoScheduleGenerated = memberRepository.sumAllAutoGenUsed();

		// 최근 가입한 회원 - fetch join으로 한 방에 조회 (N+1 제거!)
		Pageable pageable = PageRequest.of(page, size);
		var memberPage = memberRepository.findAllWithWard(pageable);
		List<Member> recentMembers = memberPage.getContent();

		// 병동별 통계 - 모든 병동 조회
		List<Ward> wards = wardRepository.findAll();

		// 병동별 간호사 수 - 한 방 쿼리 (N+1 제거!)
		List<Object[]> wardMemberCounts = wardMemberRepository.countByWardGroupByRole();

		// wardId -> (Role -> Count) 맵 생성
		Map<Long, Map<Role, Long>> wardStatsMap = new HashMap<>();
		for (Object[] row : wardMemberCounts) {
			Long wardId = (Long) row[0];
			Role role = (Role) row[1];
			Long count = (Long) row[2];

			wardStatsMap.putIfAbsent(wardId, new HashMap<>());
			wardStatsMap.get(wardId).put(role, count);
		}

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm");

		return AdminStatisticsResponseDto.builder()
			.totalMembers(totalMembers)
			.totalWards(totalWards)
			.totalNurses(totalNurses)
			.totalHeadNurses(totalHeadNurses)
			.totalActiveMembers(totalActiveMembers)
			.totalAutoScheduleGenerated(totalAutoScheduleGenerated)
			.recentMembers(recentMembers.stream()
				.map(m -> AdminStatisticsResponseDto.MemberStatDto.builder()
					.memberId(m.getMemberId())
					.email(m.getEmail())
					.name(m.getName())
					.role(m.getRole() != null ? m.getRole().name() : "N/A")
					.autoGenCnt(m.getAutoGenCnt())
					.createdAt(sdf.format(m.getCreatedAt()))
					.lastLoginAt(m.getLastLoginAt() != null ? sdf.format(m.getLastLoginAt()) : "로그인 기록 없음")
					.wardName(m.getWardMember() != null && m.getWardMember().getWard() != null
						? m.getWardMember().getWard().getWardName() : "병동 미소속")
					.build())
				.collect(Collectors.toList()))
			.wardStats(wards.stream()
				.map(w -> {
					// 맵에서 조회 (쿼리 없음!)
					Map<Role, Long> counts = wardStatsMap.getOrDefault(w.getWardId(), new HashMap<>());
					long nurseCount = counts.getOrDefault(Role.RN, 0L);
					long headNurseCount = counts.getOrDefault(Role.HN, 0L);

					return AdminStatisticsResponseDto.WardStatDto.builder()
						.wardId(w.getWardId())
						.wardName(w.getWardName())
						.hospitalName(w.getHospitalName())
						.nurseCount(nurseCount)
						.headNurseCount(headNurseCount)
						.build();
				})
				.collect(Collectors.toList()))
			.currentPage(memberPage.getNumber())
			.totalPages(memberPage.getTotalPages())
			.totalElements(memberPage.getTotalElements())
			.build();
	}

	@Transactional(readOnly = true)
	public UserGrowthResponseDto getUserGrowth() {
		// 현재 시간
		long currentTimeMillis = System.currentTimeMillis();

		// 1일 전 시간 계산 (어제 자정)
		long oneDayAgoMillis = currentTimeMillis - TimeUnit.DAYS.toMillis(1);
		Timestamp oneDayAgoTimestamp = new Timestamp(oneDayAgoMillis);

		// 1주일 전 시간 계산 (7일 전)
		long oneWeekAgoMillis = currentTimeMillis - TimeUnit.DAYS.toMillis(7);
		Timestamp oneWeekAgoTimestamp = new Timestamp(oneWeekAgoMillis);

		// 현재 총 가입자 수 (temp 간호사 제외)
		long currentTotalUsers = memberRepository.countRealMembers(TEMP_NURSE_EMAIL);

		// 어제 총 가입자 수 (temp 간호사 제외)
		long yesterdayTotalUsers = memberRepository.countRealMembersBefore(TEMP_NURSE_EMAIL, oneDayAgoTimestamp);

		// 1주일 전 총 가입자 수 (temp 간호사 제외)
		long oneWeekAgoTotalUsers = memberRepository.countRealMembersBefore(TEMP_NURSE_EMAIL, oneWeekAgoTimestamp);

		// 일일 증가한 사용자 수
		long dailyGrowth = currentTotalUsers - yesterdayTotalUsers;

		// 1주일간 증가한 사용자 수
		long weeklyGrowth = currentTotalUsers - oneWeekAgoTotalUsers;

		// 증가율 계산 (주간 기준, %)
		double growthRate = oneWeekAgoTotalUsers > 0
			? ((double) weeklyGrowth / oneWeekAgoTotalUsers) * 100.0
			: 0.0;

		// 메시지 생성
		String message = String.format("지난 7일간 %d명의 신규 가입자가 증가했습니다. (%.2f%% 증가)",
			weeklyGrowth, growthRate);

		return UserGrowthResponseDto.builder()
			.currentTotalUsers(currentTotalUsers)
			.oneWeekAgoTotalUsers(oneWeekAgoTotalUsers)
			.yesterdayTotalUsers(yesterdayTotalUsers)
			.dailyGrowth(dailyGrowth)
			.weeklyGrowth(weeklyGrowth)
			.growthRate(Math.round(growthRate * 100.0) / 100.0) // 소수점 2자리 반올림
			.message(message)
			.build();
	}
}

package net.dutymate.api.domain.admin.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import net.dutymate.api.domain.admin.dto.DashboardStatsResponseDto;
import net.dutymate.api.domain.admin.dto.UpdateWardCapacityRequestDto;
import net.dutymate.api.domain.admin.dto.WardListResponseDto;
import net.dutymate.api.domain.common.utils.YearMonth;
import net.dutymate.api.domain.member.repository.MemberRepository;
import net.dutymate.api.domain.ward.Ward;
import net.dutymate.api.domain.ward.repository.WardRepository;
import net.dutymate.api.domain.wardmember.WardMember;
import net.dutymate.api.domain.wardmember.repository.WardMemberRepository;
import net.dutymate.api.domain.wardschedules.dto.WardScheduleResponseDto;
import net.dutymate.api.domain.wardschedules.service.WardScheduleService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

	private final WardRepository wardRepository;
	private final WardMemberRepository wardMemberRepository;
	private final WardScheduleService wardScheduleService;
	private final MemberRepository memberRepository;

	public WardListResponseDto getAllWards(Pageable pageable) {
		Page<Ward> wardPage = wardRepository.findAll(pageable);
		return WardListResponseDto.of(wardPage);
	}

	public WardScheduleResponseDto getWardDuty(Long wardId, YearMonth yearMonth, Integer history) {

		Ward ward = wardRepository.findById(wardId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "병동을 찾을 수 없습니다."));

		WardMember headNurse = wardMemberRepository.findAllByWard(ward).stream()
			.findFirst()
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "병동에 수간호사가 없습니다."));

		return wardScheduleService.getWardSchedule(headNurse.getMember(), yearMonth, history);
	}

	@Transactional
	public void updateWardCapacity(Long wardId, UpdateWardCapacityRequestDto requestDto) {
		Ward ward = wardRepository.findById(wardId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "병동을 찾을 수 없습니다."));

		ward.setMaxNurseCount(requestDto.getMaxNurseCount());
		ward.setMaxTempNurseCount(requestDto.getMaxTempNurseCount());

		wardRepository.save(ward);
	}

	public DashboardStatsResponseDto getDashboardStats() {
		long totalUsers = memberRepository.countRealUsers();
		long totalWards = wardRepository.count();

		// TODO: S3에서 어제 로그인한 유저 수 조회 (현재는 0 반환)
		long yesterdayLoginCount = 0;

		return DashboardStatsResponseDto.builder()
			.totalUsers(totalUsers)
			.totalWards(totalWards)
			.yesterdayLoginCount(yesterdayLoginCount)
			.build();
	}

}

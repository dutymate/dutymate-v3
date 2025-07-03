package net.dutymate.api.domain.wardmember.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import net.dutymate.api.domain.common.utils.YearMonth;
import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.member.repository.MemberRepository;
import net.dutymate.api.domain.member.service.MemberService;
import net.dutymate.api.domain.ward.Ward;
import net.dutymate.api.domain.wardmember.Role;
import net.dutymate.api.domain.wardmember.WardMember;
import net.dutymate.api.domain.wardmember.dto.NurseInfoRequestDto;
import net.dutymate.api.domain.wardschedules.collections.WardSchedule;
import net.dutymate.api.domain.wardschedules.repository.WardScheduleRepository;
import net.dutymate.api.domain.wardschedules.util.InitialDutyGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WardMemberService {

	private final MemberRepository memberRepository;
	private final WardScheduleRepository wardScheduleRepository;
	private final InitialDutyGenerator initialDutyGenerator;

	@Transactional
	public void updateWardMember(Long memberId, NurseInfoRequestDto nurseInfoRequestDto, Member authMember) {

		// memberId로 Member 찾기
		Member member = memberRepository.findById(memberId).orElseThrow(() -> new ResponseStatusException(
			HttpStatus.BAD_REQUEST, "유효하지 않은 memberId 입니다."));

		// member가 병동 회원인지 체크하는 로직
		validateWardMember(member, authMember);

		if (member.getRole() == Role.HN && nurseInfoRequestDto.getRole().equals("RN")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자는 간호사로 변경이 불가합니다.");
		}

		// 멤버와 1:1 매핑 되어 있는 wardMember 정보 수정
		member.getWardMember().updateWardMemberInfo(
			nurseInfoRequestDto.getShiftFlags(),
			nurseInfoRequestDto.getSkillLevel(),
			nurseInfoRequestDto.getMemo(),
			nurseInfoRequestDto.getRole(),
			nurseInfoRequestDto.getWorkIntensity()
		);
	}

	@Transactional
	public void deleteWardMember(List<Long> memberIds, Member authMember) {

		if (memberIds == null || memberIds.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "memberIds가 비어있는 값입니다.");
		}

		// 내보내려는 멤버 찾기
		List<Member> members = memberRepository.findAllById(memberIds);

		for (Member member : members) {
			// member가 병동 회원인지 체크하는 로직
			validateWardMember(member, authMember);

			WardMember wardMember = member.getWardMember();
			Ward ward = wardMember.getWard();

			// member의 role 초기화하기
			// member.updateRole(null);
			member.clearEnterDate();

			// RDB에서 wardMember 삭제하기
			ward.removeWardMember(wardMember); // 리스트에서 제거(연관관계 제거)

			// 임시 간호사이면 탈퇴 처리
			if (member.getEmail().equals(MemberService.TEMP_NURSE_EMAIL)) {
				memberRepository.delete(member);
			}

			// MongoDB 에서 내보내는 wardmember 찾아서 삭제 (이전 달은 상관 X)
			// 이번달 듀티에서 삭제
			YearMonth yearMonth = YearMonth.nowYearMonth();
			wardScheduleRepository
				.findByWardIdAndYearAndMonth(ward.getWardId(), yearMonth.year(), yearMonth.month())
				.ifPresent(currMonthSchedule -> deleteWardMemberDuty(currMonthSchedule, member));

			// 다음달 듀티에서 삭제
			YearMonth nextYearMonth = yearMonth.nextYearMonth();
			wardScheduleRepository
				.findByWardIdAndYearAndMonth(ward.getWardId(), nextYearMonth.year(), nextYearMonth.month())
				.ifPresent(nextMonthSchedule -> deleteWardMemberDuty(nextMonthSchedule, member));

		}
	}

	public void deleteWardMemberDuty(WardSchedule existingSchedule, Member member) {

		// 마지막 nowIdx가 가리키는 Duty 가져오기
		WardSchedule.Duty currDuty = existingSchedule.getDuties().get(existingSchedule.getNowIdx());

		WardSchedule.Duty newDuty = WardSchedule.Duty.builder()
			.idx(0)
			.duty(new ArrayList<>(currDuty.getDuty()))
			.history(initialDutyGenerator.createInitialHistory())
			.build();

		newDuty.getDuty().removeIf(nurseShift -> nurseShift.getMemberId().equals(member.getMemberId()));

		WardSchedule deletedSchedule = WardSchedule.builder()
			.id(existingSchedule.getId())
			.wardId(existingSchedule.getWardId())
			.year(existingSchedule.getYear())
			.month(existingSchedule.getMonth())
			.duties(new ArrayList<>(List.of(newDuty))) // 기존 duties 초기화 시키고, 나간 멤버가 삭제된 duty 하나만 남기기
			.build();

		wardScheduleRepository.save(deletedSchedule);
	}

	/**
	 * member가 관리자(authMember)가 속한 병동 회원인지 체크하는 로직
	 */
	private void validateWardMember(Member member, Member authMember) {
		WardMember authWardMember = authMember.getWardMember();
		Ward authWard = authWardMember.getWard();

		if (member.getWardMember().getWard() != authWard) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동 회원이 아닙니다.");
		}
	}
}

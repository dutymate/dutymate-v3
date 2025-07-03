package net.dutymate.api.domain.ward.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import net.dutymate.api.domain.common.service.S3Service;
import net.dutymate.api.domain.common.utils.YearMonth;
import net.dutymate.api.domain.member.Gender;
import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.member.Provider;
import net.dutymate.api.domain.member.repository.MemberRepository;
import net.dutymate.api.domain.member.service.MemberService;
import net.dutymate.api.domain.member.util.StringGenerator;
import net.dutymate.api.domain.ward.EnterWaiting;
import net.dutymate.api.domain.ward.Hospital;
import net.dutymate.api.domain.ward.Ward;
import net.dutymate.api.domain.ward.dto.AddNurseCntRequestDto;
import net.dutymate.api.domain.ward.dto.EnterAcceptRequestDto;
import net.dutymate.api.domain.ward.dto.EnterWaitingResponseDto;
import net.dutymate.api.domain.ward.dto.HospitalNameResponseDto;
import net.dutymate.api.domain.ward.dto.ShiftsComparisonResponseDto;
import net.dutymate.api.domain.ward.dto.TempNurseResponseDto;
import net.dutymate.api.domain.ward.dto.VirtualEditRequestDto;
import net.dutymate.api.domain.ward.dto.WardInfoResponseDto;
import net.dutymate.api.domain.ward.dto.WardRequestDto;
import net.dutymate.api.domain.ward.repository.EnterWaitingRepository;
import net.dutymate.api.domain.ward.repository.HospitalRepository;
import net.dutymate.api.domain.ward.repository.WardRepository;
import net.dutymate.api.domain.wardmember.Role;
import net.dutymate.api.domain.wardmember.WardMember;
import net.dutymate.api.domain.wardmember.repository.WardMemberRepository;
import net.dutymate.api.domain.wardschedules.collections.MemberSchedule;
import net.dutymate.api.domain.wardschedules.collections.WardSchedule;
import net.dutymate.api.domain.wardschedules.repository.MemberScheduleRepository;
import net.dutymate.api.domain.wardschedules.repository.WardScheduleRepository;
import net.dutymate.api.domain.wardschedules.service.WardScheduleService;
import net.dutymate.api.domain.wardschedules.util.InitialDutyGenerator;
import net.dutymate.api.domain.wardschedules.util.ShiftUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WardService {

	private final WardRepository wardRepository;
	private final WardMemberRepository wardMemberRepository;
	private final WardScheduleRepository wardScheduleRepository;
	private final InitialDutyGenerator initialDutyGenerator;
	private final MemberRepository memberRepository;
	private final EnterWaitingRepository enterWaitingRepository;
	private final HospitalRepository hospitalRepository;
	private final WardScheduleService wardScheduleService;
	private final MemberScheduleRepository memberScheduleRepository;

	private static final int MAX_VIRTUAL_NURSE_COUNT = 25;
	private static final int MAX_NURSE_COUNT = 30;
	private final ShiftUtil shiftUtil;
	private final S3Service s3Service;

	@Transactional
	public void createWard(WardRequestDto requestWardDto, Member member) {
		// 1. 로그인한 member가 이미 병동을 생성했다면, 400(BAD_REQUEST)
		boolean exists = wardMemberRepository.existsByMember(member);

		if (exists) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 병동이 있습니다.");
		}

		// 2. Ward  생성 -> Rule 자동 생성
		Ward ward = requestWardDto.toWard(StringGenerator.generateWardCode());
		wardRepository.save(ward);

		// 3. WardMember 생성 (로그인한 사용자 추가)
		WardMember wardMember = WardMember.builder()
			.isSynced(true)
			.ward(ward)
			.member(member)
			.build();
		wardMemberRepository.save(wardMember);

		// ward의 List에 wardMember 추가
		ward.addWardMember(wardMember);

		// 4. 현재 날짜 기준으로  year, month 생성
		YearMonth yearMonth = YearMonth.nowYearMonth();

		// 5. 병동 생성하는 멤버의 듀티표 초기화하여 mongodb에 저장하기
		initialDutyGenerator.initializedDuty(wardMember, yearMonth);

		// 병동 생성한 멤버 입장 연월 설정
		member.changeEnterYearMonth(YearMonth.nowYearMonth());
		member.setRole(Role.HN);
	}

	@Transactional
	public void addToEnterWaiting(String wardCode, Member member) {
		// 0. 이미 입장 대기중인 병동이 있는지 확인
		if (enterWaitingRepository.existsByMember(member)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 입장 대기중인 병동이 있습니다.");
		}

		// 1. wardCode에 해당하는 ward가 존재하는지 확인
		Ward ward = wardRepository.findByWardCode(wardCode)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 병동 코드입니다."));

		// 2. 이미 ward에 입장한 회원인지 확인
		boolean isAlreadyEnteredWard = wardMemberRepository.existsByMember(member);
		if (isAlreadyEnteredWard) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 입장한 병동이 있습니다.");
		}

		// 3. 입장 대기 엔티티 생성 및 저장
		EnterWaiting enterWaiting = EnterWaiting.builder()
			.member(member)
			.ward(ward)
			.build();
		enterWaitingRepository.save(enterWaiting);
	}

	@Transactional
	public void enterDenied(Long enterMemberId, Member member) {
		// 수간호사가 아니면 예외 처리
		if (!member.getRole().equals(Role.HN)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자가 아닙니다.");
		}

		// 수간호사가 속한 병동 불러오기
		Ward ward = Optional.ofNullable(member.getWardMember())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동에 속해있지 않은 회원입니다."))
			.getWard();

		// 입장 요청한 멤버 정보 불러오기
		Member enterMember = memberRepository.findById(enterMemberId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "입장 요청한 회원 정보를 찾을 수 없습니다."));

		// 입장 대기 테이블에 없는 경우 예외 처리
		if (!enterWaitingRepository.existsByMemberAndWard(enterMember, ward)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "입장 요청하지 않은 회원입니다.");
		}

		// 병동 입장을 승인한 경우
		// if (enterStatus.equals(EnterStatus.ACCEPTED)) {
		// 	enterToWard(ward, enterMember);
		// }

		// 병동 입장을 승인 or 거절하는 경우 모두 입장 대기 테이블에서 삭제시켜야 함
		enterWaitingRepository.removeByMemberAndWard(enterMember, ward);
	}

	@Transactional
	public void enterAcceptWithoutLink(Long enterMemberId, EnterAcceptRequestDto enterAcceptRequestDto, Member member) {
		// 수간호사가 아니면 예외 처리
		if (!member.getRole().equals(Role.HN)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자가 아닙니다.");
		}

		// 수간호사가 속한 병동 불러오기
		Ward ward = Optional.ofNullable(member.getWardMember())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동에 속해있지 않은 회원입니다."))
			.getWard();

		// 입장 요청한 멤버 정보 불러오기
		Member enterMember = memberRepository.findById(enterMemberId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "입장 요청한 회원 정보를 찾을 수 없습니다."));

		// 입장 대기 테이블에 없는 경우 예외 처리
		if (!enterWaitingRepository.existsByMemberAndWard(enterMember, ward)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "입장 요청하지 않은 회원입니다.");
		}

		// 와드 스케줄에 입장 멤버 추가, 선택된 shifts도 반영
		enterToWard(ward, enterMember, enterAcceptRequestDto.getAppliedShifts());

		// 병동 입장을 승인 or 거절하는 경우 모두 입장 대기 테이블에서 삭제시켜야 함
		enterWaitingRepository.removeByMemberAndWard(enterMember, ward);

		// 입장한 멤버 입장 연월 설정
		YearMonth nowYearMonth = YearMonth.nowYearMonth();
		enterMember.changeEnterYearMonth(nowYearMonth);

		List<WardSchedule> allWardSchedule = wardScheduleRepository.findAllByWardId(ward.getWardId());

		List<MemberSchedule> memberSchedulesToSave = new ArrayList<>();
		for (WardSchedule wardSchedule : allWardSchedule) {
			YearMonth wardScheduleYearMonth = new YearMonth(wardSchedule.getYear(), wardSchedule.getMonth());
			// 입장 연월 이후의 병동 스케줄 -> 멤버 스케줄 연동 (덮어쓰기)
			if (wardScheduleYearMonth.isSameOrAfter(nowYearMonth)) {
				MemberSchedule memberSchedule
					= wardScheduleService.getOrCreateMemberSchedule(enterMember.getMemberId(), wardScheduleYearMonth);
				String updatedShifts = wardScheduleService.getShiftsInWard(enterMember, wardSchedule,
					wardScheduleYearMonth.daysInMonth());
				memberSchedule.setShifts(updatedShifts);
				memberSchedulesToSave.add(memberSchedule);
			}
		}
		memberScheduleRepository.saveAll(memberSchedulesToSave);

	}

	@Transactional
	public void enterAcceptWithLink(Long enterMemberId, EnterAcceptRequestDto enterAcceptRequestDto, Member member) {
		// 수간호사가 아니면 예외 처리
		if (!member.getRole().equals(Role.HN)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자가 아닙니다.");
		}

		// 수간호사가 속한 병동 불러오기
		Ward ward = Optional.ofNullable(member.getWardMember())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동에 속해있지 않은 회원입니다."))
			.getWard();

		// 입장 요청한 멤버 정보 불러오기
		Member enterMember = memberRepository.findById(enterMemberId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "입장 요청한 회원 정보를 찾을 수 없습니다."));

		// 입장 대기 테이블에 없는 경우 예외 처리
		if (!enterWaitingRepository.existsByMemberAndWard(enterMember, ward)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "입장 요청하지 않은 회원입니다.");
		}

		Member linkedTempMember = memberRepository.findById(enterAcceptRequestDto.getTempMemberId())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "임시 간호사를 찾을 수 없습니다."));

		// 입장 멤버 정보를 임시 멤버로 변경
		enterMember.linkMember(linkedTempMember);
		WardMember wardMember = linkedTempMember.getWardMember();
		wardMember.changeIsSynced(true);
		wardMember.changeMember(enterMember);

		// 입장한 멤버 입장 연월 설정
		YearMonth nowYearMonth = YearMonth.nowYearMonth();
		enterMember.changeEnterYearMonth(nowYearMonth);

		// ===== 현재 달 병동 스케줄을 선택한 shifts로 업데이트 START =====
		WardSchedule currWardSchedule = wardScheduleRepository
			.findByWardIdAndYearAndMonth(ward.getWardId(), nowYearMonth.year(), nowYearMonth.month())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동 스케줄을 찾을 수 없습니다."));

		WardSchedule.Duty currDuty = currWardSchedule.getDuties().get(currWardSchedule.getNowIdx());
		for (WardSchedule.NurseShift nurseShift : currDuty.getDuty()) {
			// 여기서 연동할 임시 멤버 ID 찾고 shifts 업데이트
			if (nurseShift.getMemberId().equals(linkedTempMember.getMemberId())) {
				nurseShift.changeShifts(enterAcceptRequestDto.getAppliedShifts());
				break;
			}
		}

		WardSchedule.Duty newDuty = WardSchedule.Duty.builder()
			.idx(0)
			.duty(new ArrayList<>(currDuty.getDuty()))
			.history(initialDutyGenerator.createInitialHistory())
			.build();

		currWardSchedule = WardSchedule.builder()
			.id(currWardSchedule.getId())
			.wardId(ward.getWardId())
			.year(currWardSchedule.getYear())
			.month(currWardSchedule.getMonth())
			.nowIdx(0)
			.duties(new ArrayList<>(List.of(newDuty)))
			.build();

		wardScheduleRepository.save(currWardSchedule);
		// ===== 현재 달 병동 스케줄을 선택한 듀티로 업데이트 END =====

		// 병동 스케줄 순회
		List<WardSchedule> allWardSchedule = wardScheduleRepository.findAllByWardId(ward.getWardId());

		// 1. 현재 연월 wardSchedule 조회 후
		// 2. 선택된 듀티표로 nurseShift 업데이트, history 초기화(개인 듀티 선택 시)

		List<MemberSchedule> memberSchedulesToSave = new ArrayList<>();
		for (WardSchedule wardSchedule : allWardSchedule) {
			// 1. 병동 스케줄에서 memberId 변경
			for (WardSchedule.Duty duty : wardSchedule.getDuties()) {
				for (WardSchedule.NurseShift nurseShift : duty.getDuty()) {
					if (Objects.equals(nurseShift.getMemberId(), linkedTempMember.getMemberId())) {
						nurseShift.setMemberId(enterMemberId);
					}
				}
				if (Objects.equals(duty.getHistory().getMemberId(), linkedTempMember.getMemberId())) {
					duty.getHistory().setMemberId(enterMemberId);
				}
			}

			YearMonth wardScheduleYearMonth = wardSchedule.getYearMonth();

			// 입장 연월 이후의 병동 스케줄 -> 멤버 스케줄 연동 (덮어쓰기)
			if (wardScheduleYearMonth.isSameOrAfter(nowYearMonth)) {
				MemberSchedule memberSchedule
					= wardScheduleService.getOrCreateMemberSchedule(enterMember.getMemberId(), wardScheduleYearMonth);
				String updatedShifts = wardScheduleService.getShiftsInWard(enterMember, wardSchedule,
					wardScheduleYearMonth.daysInMonth());
				memberSchedule.setShifts(updatedShifts);
				memberSchedulesToSave.add(memberSchedule);
			}
		}
		wardScheduleRepository.saveAll(allWardSchedule);
		memberScheduleRepository.saveAll(memberSchedulesToSave);

		// 병동 입장을 승인 or 거절하는 경우 모두 입장 대기 테이블에서 삭제시켜야 함
		enterWaitingRepository.removeByMemberAndWard(enterMember, ward);

		// 임시 멤버는 테이블에서 삭제
		memberRepository.delete(linkedTempMember);
	}

	public void enterToWard(Ward ward, Member member, String appliedShifts) {
		// 1. wardCode에 해당하는 ward가 존재하는지 확인
		// Ward ward = wardRepository.findByWardCode(wardCode)
		// 	.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 병동 코드입니다."));

		// 2. 이미 ward에 입장한 회원인지 확인
		boolean isAlreadyEnteredWard = wardMemberRepository.existsByMember(member);
		if (isAlreadyEnteredWard) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 입장한 병동이 있습니다.");
		}

		// 3. 유효한 코드라면, 병동 회원으로 추가하기
		WardMember newWardMember = WardMember.builder()
			.isSynced(true)
			.ward(ward)
			.member(member)
			.build();

		wardMemberRepository.save(newWardMember);
		ward.addWardMember(newWardMember);

		// 4. 병동 Id로 MongoDB에 추가된 현재달과 다음달 듀티 확인
		// 4-1. 이번달 듀티
		YearMonth yearMonth = YearMonth.nowYearMonth();

		WardSchedule currMonthSchedule = wardScheduleRepository.findByWardIdAndYearAndMonth(
			ward.getWardId(), yearMonth.year(), yearMonth.month()).orElse(null);

		// 4-2. 다음달 듀티
		YearMonth nextYearMonth = yearMonth.nextYearMonth();

		WardSchedule nextMonthSchedule = wardScheduleRepository.findByWardIdAndYearAndMonth(
			ward.getWardId(), nextYearMonth.year(), nextYearMonth.month()).orElse(null);

		// 5. 기존 스케줄이 존재한다면, 새로운 스냅샷 생성 및 초기화된 duty 추가하기
		if (currMonthSchedule != null) {
			currMonthSchedule = initialDutyGenerator
				.updateDutyWithNewMember(currMonthSchedule, newWardMember, appliedShifts);
			wardScheduleRepository.save(currMonthSchedule);
		}

		if (nextMonthSchedule != null) {
			nextMonthSchedule = initialDutyGenerator
				.updateDutyWithNewMember(nextMonthSchedule, newWardMember, nextYearMonth.initializeShifts());
			wardScheduleRepository.save(nextMonthSchedule);
		}
	}

	@Transactional
	public WardInfoResponseDto getWardInfo(Member member) {
		// 1. 현재 member(관리자)의 wardmemberId 조회
		WardMember wardMember = wardMemberRepository.findByMember(member);

		if (wardMember == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 멤버가 속한 병동을 찾을 수 없습니다.");
		}

		// 2. 관리자가 속한 병동 조회
		Ward ward = wardMember.getWard();

		// 3. 해당 병동의 모든 wardMember 조회
		List<WardMember> wardMemberList = wardMemberRepository.findAllByWard(ward);

		// 4. 입장 대기 인원 조회
		long enterWaitingCnt = enterWaitingRepository.countByWard(ward);

		// 데모계정인 경우 -> 병동 코드를 빈 문자열로 삽입
		WardInfoResponseDto wardInfoResponseDto = WardInfoResponseDto.of(ward, wardMemberList, enterWaitingCnt);
		if (member.getEmail().endsWith(MemberService.DEMO_EMAIL_SUFFIX)) {
			wardInfoResponseDto.setWardCode("");
		}
		return wardInfoResponseDto;
	}

	@Transactional(readOnly = true)
	public List<EnterWaitingResponseDto> getEnterWaitingList(Member member) {
		// 수간호사가 아니면 예외 처리
		if (!member.getRole().equals(Role.HN)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자가 아닙니다.");
		}

		// 수간호사가 속한 병동 불러오기
		Ward ward = Optional.ofNullable(member.getWardMember())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동에 속해있지 않은 회원입니다."))
			.getWard();

		// EnterWaiting -> DTO 변환 후 반환
		return enterWaitingRepository.findByWard(ward)
			.stream()
			.map(EnterWaitingResponseDto::of)
			.toList();
	}

	@Transactional(readOnly = true)
	public List<TempNurseResponseDto> getTempNuserList(Member member) {
		// 수간호사가 아니면 예외 처리
		if (!member.getRole().equals(Role.HN)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자가 아닙니다.");
		}

		// 수간호사가 속한 병동 불러오기
		Ward ward = Optional.ofNullable(member.getWardMember())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동에 속해있지 않은 회원입니다."))
			.getWard();

		return ward.getWardMemberList().stream()
			.filter(wardMember -> !wardMember.getIsSynced())
			.map(WardMember::getMember)
			.map(TempNurseResponseDto::of)
			.toList();
	}

	@Transactional
	public void addVirtualMember(AddNurseCntRequestDto addNurseCntRequestDto, Member member) {
		int addNurseCnt = addNurseCntRequestDto.getVirtualNurseCnt();

		// 1. 수간호사가 아니면 예외 처리
		if (!member.getRole().equals(Role.HN)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자가 아닙니다.");
		}

		// 2. 병동 불러오기
		Ward ward = Optional.ofNullable(member.getWardMember())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동에 속해있지 않은 회원입니다."))
			.getWard();

		// 병동 최대 인원 로직 추가

		// 연동 간호사 수
		int syncedNurseCnt = ward.getWardMemberList().stream()
			.filter(WardMember::getIsSynced)
			.toList().size();
		// 전체 간호사 수
		int wardMemberCnt = ward.getWardMemberList().size();

		// 1. 임시 간호사 최대 20명
		if (wardMemberCnt - syncedNurseCnt + addNurseCnt > MAX_VIRTUAL_NURSE_COUNT) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "임시 간호사 수는 25명을 초과할 수 없습니다.");
		}

		// 2. 병동 간호사 최대 30명
		if (wardMemberCnt + addNurseCnt > MAX_NURSE_COUNT) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동 간호사 수는 30명을 초과할 수 없습니다.");
		}

		// 3. 새로운 임시간호사와 WardMember 만들기
		List<Member> newMemberList = new ArrayList<>();
		List<WardMember> newWardMemberList = new ArrayList<>();

		Integer tempNurseSeq = ward.getTempNurseSeq();
		String defaultProfileImgUrl = s3Service.addBasicProfileImgUrl();

		for (int newNurse = 0; newNurse < addNurseCnt; newNurse++) {

			String virtualNurseName = "간호사" + (++tempNurseSeq);

			// 4. 병동 회원으로 가상 간호사 추가하기
			Member virtualMember = Member.builder()
				.email(MemberService.TEMP_NURSE_EMAIL)
				.name(virtualNurseName)
				.password("tempPassword123!!")
				.grade(1)
				.role(Role.RN)
				.gender(Gender.F)
				.provider(Provider.NONE)
				.profileImg(defaultProfileImgUrl)
				.autoGenCnt(0)
				.build();
			newMemberList.add(virtualMember);
		}
		ward.changeTempNurseSeq(tempNurseSeq);
		memberRepository.saveAll(newMemberList);

		for (Member virtualMember : newMemberList) {
			// 새로운 병동 멤버로 추가
			WardMember virtualNurse = WardMember.builder()
				.isSynced(false)
				.ward(ward)
				.member(virtualMember)
				.build();
			// wardMemberRepository.save(virtualNurse);
			newWardMemberList.add(virtualNurse);
			ward.addWardMember(virtualNurse);
		}

		// RDB에 한 번에 저장
		wardMemberRepository.saveAll(newWardMemberList);

		// MongoDB 저장 (JPA 트랜잭션과 분리)
		wardScheduleService.updateWardSchedules(ward.getWardId(), newWardMemberList);
	}

	@Transactional
	public void changeVirtualMember(
		Long changeMemberId, VirtualEditRequestDto virtualEditRequestDto, Member member) {
		// 수간호사가 아니면 예외 처리
		if (!member.getRole().equals(Role.HN)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자가 아닙니다.");
		}

		// 이름 변경할 가상 간호사 불러오기
		Member changeMember = memberRepository.findById(changeMemberId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 멤버입니다."));

		// 수간호사와 가상간호사가 같은 병동에 속한지 확인하기
		if (changeMember.getWardMember() != null && member.getWardMember() != null
			&& changeMember.getWardMember().getWard() != member.getWardMember().getWard()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "같은 병동에 속하지 않은 간호사입니다.");
		}

		// 정보 수정
		changeMember.changeTempMember(
			virtualEditRequestDto.getName(), virtualEditRequestDto.getGender(), virtualEditRequestDto.getGrade());
	}

	public List<HospitalNameResponseDto> findHospitalName(String query) {
		List<Hospital> hospitalList = hospitalRepository.findByHospitalNameContaining(query, PageRequest.of(0, 5));

		return hospitalList.stream().map(HospitalNameResponseDto::of).toList();

	}

	@Transactional(readOnly = true)
	public ShiftsComparisonResponseDto getShiftsComparison(Long enterMemberId, Long tempMemberId) {
		// 1. 입장 멤버 초기화
		if (!memberRepository.existsById(enterMemberId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원을 찾을 수 없습니다.");
		}

		// 2. 현재 연월 초기화
		YearMonth nowYearMonth = YearMonth.nowYearMonth();

		// 3. 입장 멤버의 현재 연월 shifts 불러오기
		String enterMemberShifts = wardScheduleService
			.getOrCreateMemberSchedule(enterMemberId, nowYearMonth)
			.getShifts();

		// 4. 임시 멤버의 현재 연월 shifts 불러오기
		String tempMemberShifts;

		if (tempMemberId == null) {
			// 4-1. 임시 멤버와 연동하지 않고 추가 시 "X" 한달 치 반환
			tempMemberShifts = nowYearMonth.initializeShifts();
		} else {
			// 4-2. 임시 멤버와 연동 시, 임시 멤버의 현재 연월 shifts 반환
			Member tempMember = memberRepository.findById(tempMemberId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "회원을 찾을 수 없습니다."));

			if (tempMember.getWardMember() == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "병동에 속하지 않은 회원입니다.");
			}

			// 4-3. 임시 멤버의 현재 연월 shifts 불러오기
			tempMemberShifts = shiftUtil.getShifts(nowYearMonth.year(), nowYearMonth.month(), tempMember);
		}

		return ShiftsComparisonResponseDto.of(enterMemberShifts, tempMemberShifts);
	}

}

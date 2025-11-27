package net.dutymate.api.domain.admin.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.dutymate.api.domain.admin.dto.AdminNurseListResponseDto;
import net.dutymate.api.domain.admin.dto.DashboardStatsResponseDto;
import net.dutymate.api.domain.admin.dto.UpdateWardCapacityRequestDto;
import net.dutymate.api.domain.admin.dto.WardListResponseDto;
import net.dutymate.api.domain.admin.service.AdminService;
import net.dutymate.api.domain.common.utils.YearMonth;
import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.wardschedules.dto.WardScheduleResponseDto;
import net.dutymate.api.global.auth.annotation.AdminOnly;
import net.dutymate.api.global.auth.annotation.Auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;

	@GetMapping("/statics")
	@AdminOnly
	public ResponseEntity<WardListResponseDto> getStatics(
		@Auth Member member,
		@PageableDefault(size = 20, sort = "wardId", direction = Sort.Direction.DESC) Pageable pageable
	) {
		WardListResponseDto response = adminService.getAllWards(pageable);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/wards/{wardId}/duty")
	@AdminOnly
	public ResponseEntity<WardScheduleResponseDto> getWardDuty(
		@Auth Member member,
		@PathVariable Long wardId,
		@RequestParam(required = false) Integer year,
		@RequestParam(required = false) Integer month,
		@RequestParam(required = false) Integer history
	) {
		WardScheduleResponseDto response = adminService.getWardDuty(wardId, new YearMonth(year, month), history);
		return ResponseEntity.ok(response);
	}

	@PatchMapping("/wards/{wardId}/capacity")
	@AdminOnly
	public ResponseEntity<Void> updateWardCapacity(
		@Auth Member member,
		@PathVariable Long wardId,
		@Valid @RequestBody UpdateWardCapacityRequestDto requestDto
	) {
		adminService.updateWardCapacity(wardId, requestDto);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/dashboard/stats")
	@AdminOnly
	public ResponseEntity<DashboardStatsResponseDto> getDashboardStats(@Auth Member member) {
		DashboardStatsResponseDto stats = adminService.getDashboardStats();
		return ResponseEntity.ok(stats);
	}


	@GetMapping("/nurse")
	@AdminOnly
	public ResponseEntity<AdminNurseListResponseDto> getNurseList(
		@Auth Member member,
		@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		AdminNurseListResponseDto response = adminService.getNurseList(pageable);
		return ResponseEntity.ok(response);
	}


}

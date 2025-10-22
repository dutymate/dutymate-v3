package net.dutymate.api.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.dutymate.api.domain.admin.dto.AdminStatisticsResponseDto;
import net.dutymate.api.domain.admin.service.AdminService;
import net.dutymate.api.domain.member.Member;
import net.dutymate.api.global.auth.annotation.AdminOnly;
import net.dutymate.api.global.auth.annotation.Auth;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;

	@AdminOnly
	@GetMapping("/statistics")
	public ResponseEntity<AdminStatisticsResponseDto> getAdminStatistics(
		@Auth Member member,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size) {
		AdminStatisticsResponseDto statistics = adminService.getAdminStatistics(member, page, size);
		return ResponseEntity.ok(statistics);
	}
}

package net.dutymate.api.domain.request.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.dutymate.api.domain.common.utils.YearMonth;
import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.request.dto.EditRequestStatusRequestDto;
import net.dutymate.api.domain.request.dto.MyRequestResponseDto;
import net.dutymate.api.domain.request.dto.RequestCreateByAdminDto;
import net.dutymate.api.domain.request.dto.RequestCreateDto;
import net.dutymate.api.domain.request.dto.WardRequestResponseDto;
import net.dutymate.api.domain.request.service.RequestService;
import net.dutymate.api.global.auth.annotation.Auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RequestController {

	private final RequestService requestService;

	@PostMapping("/request")
	public ResponseEntity<?> createRequest(
		@Auth Member member,
		@Valid @RequestBody RequestCreateDto requestCreateDto) {

		requestService.createRequest(requestCreateDto, member);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/request")
	public ResponseEntity<List<MyRequestResponseDto>> readMyRequest(@Auth Member member) {
		List<MyRequestResponseDto> myRequests = requestService.readMyRequest(member);
		return ResponseEntity.ok(myRequests);
	}

	@GetMapping("/ward/request")
	public ResponseEntity<List<WardRequestResponseDto>> readWardRequest(@Auth Member member) {
		List<WardRequestResponseDto> wardRequests = requestService.readWardRequest(member);
		return ResponseEntity.ok(wardRequests);
	}

	@GetMapping("/ward/request/date")
	public ResponseEntity<List<WardRequestResponseDto>> readWardRequestByDate(@Auth Member member,
		@RequestParam Integer year, @RequestParam Integer month) {
		List<WardRequestResponseDto> wardRequests = requestService.readWardRequestByDate(member,
			new YearMonth(year, month));
		return ResponseEntity.ok(wardRequests);
	}

	@PutMapping("/ward/request/{requestId}")
	public ResponseEntity<?> editRequestStatus(
		@Auth Member member,
		@PathVariable Long requestId,
		@RequestBody EditRequestStatusRequestDto editRequestStatusRequestDto) {
		requestService.editRequestStatus(member, requestId, editRequestStatusRequestDto);
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/request/{requestId}")
	public ResponseEntity<?> deleteRequest(@Auth Member member,
		@PathVariable Long requestId) {
		requestService.deleteRequest(member, requestId);
		return ResponseEntity.ok().build();

	}

	@PostMapping("/request/admin")
	public ResponseEntity<?> createRequestAdmin(@Auth Member member,
		@Valid @RequestBody RequestCreateByAdminDto requestCreateByAdminDto) {

		requestService.createRequestByAdmin(member, requestCreateByAdminDto);

		return ResponseEntity.ok().build();
	}

}

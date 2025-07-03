package net.dutymate.api.domain.request.dto;

import java.sql.Date;
import java.sql.Timestamp;

import net.dutymate.api.domain.request.Request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WardRequestResponseDto {

	private Long requestId;
	private Long memberId;
	private String name;
	private Date date;
	private String shift;
	private String memo;
	private String status;
	private Timestamp createdAt;

	public static WardRequestResponseDto of(Request request) {
		return WardRequestResponseDto.builder()
			.requestId(request.getRequestId())
			.memberId(request.getWardMember().getMember().getMemberId())
			.name(request.getWardMember().getMember().getName())
			.date(request.getRequestDate())
			.shift(String.valueOf(request.getRequestShift()))
			.memo(request.getMemo())
			.status(String.valueOf(request.getStatus()))
			.createdAt(request.getCreatedAt())
			.build();
	}
}

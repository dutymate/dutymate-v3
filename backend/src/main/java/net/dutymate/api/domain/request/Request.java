package net.dutymate.api.domain.request;

import java.sql.Date;
import java.sql.Timestamp;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import net.dutymate.api.domain.autoschedule.Shift;
import net.dutymate.api.domain.request.dto.RequestCreateByAdminDto;
import net.dutymate.api.domain.wardmember.WardMember;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Request {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long requestId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ward_member_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private WardMember wardMember;

	private Date requestDate;

	@Enumerated(EnumType.STRING)
	private Shift requestShift;

	private Timestamp createdAt;

	@Column(length = 200)
	private String memo;

	@Enumerated(EnumType.STRING)
	private RequestStatus status;

	public void changeStatus(RequestStatus status) {
		this.status = status;
	}

	public static Request create(RequestCreateByAdminDto dto, WardMember wardMember) {
		return Request.builder()
			.wardMember(wardMember)
			.requestDate(dto.date())
			.requestShift(Shift.valueOf(dto.shift().toUpperCase()))
			.memo(dto.memo())
			.status(RequestStatus.HOLD) // 기본값 설정
			.createdAt(new Timestamp(System.currentTimeMillis()))
			.build();
	}
}

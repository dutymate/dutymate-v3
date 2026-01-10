package net.dutymate.api.domain.wardschedules.collections;

import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class MemberSchedule {

	@Id
	private String id;

	@Setter
	private Long memberId;
	private int year;
	private int month;

	@Setter
	private String shifts;
}

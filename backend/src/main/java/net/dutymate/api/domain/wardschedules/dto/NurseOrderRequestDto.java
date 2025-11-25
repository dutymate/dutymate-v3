package net.dutymate.api.domain.wardschedules.dto;

import java.util.List;

import lombok.Data;

@Data
public class NurseOrderRequestDto {

	private Integer year;
	private Integer month;
	private List<Long> nurseOrder;
}

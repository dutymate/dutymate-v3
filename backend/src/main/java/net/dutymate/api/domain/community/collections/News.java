package net.dutymate.api.domain.community.collections;

import java.time.LocalDateTime;
import java.util.List;

import net.dutymate.api.domain.community.dto.GptApiResponseDto;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class News {

	@Id
	private String id;

	private List<GptApiResponseDto> newsList;

	private LocalDateTime createdAt;
}

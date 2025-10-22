package net.dutymate.api.domain.member.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberCountResponseDto {
    private long memberCount;
    private long previousMemberCount;
}

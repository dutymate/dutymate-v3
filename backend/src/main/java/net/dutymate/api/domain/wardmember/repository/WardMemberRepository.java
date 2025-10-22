package net.dutymate.api.domain.wardmember.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.ward.Ward;
import net.dutymate.api.domain.wardmember.Role;
import net.dutymate.api.domain.wardmember.WardMember;

@Repository
public interface WardMemberRepository extends JpaRepository<WardMember, Long> {

	Boolean existsByMember(Member member);

	WardMember findByMember(Member member);

	List<WardMember> findAllByWard(Ward ward);

	List<WardMember> findByMember_MemberIdIn(List<Long> memberIds);

	long countByMemberRole(Role role);

	long countByWardAndMemberRole(Ward ward, Role role);

	// 병동별 Role별 카운트 - 한 방 쿼리 (N+1 방지)
	@Query("SELECT wm.ward.wardId, wm.member.role, COUNT(wm) "
		+ "FROM WardMember wm "
		+ "WHERE wm.member.role IN ('HN', 'RN') "
		+ "GROUP BY wm.ward.wardId, wm.member.role")
	List<Object[]> countByWardGroupByRole();

}

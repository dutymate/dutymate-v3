package net.dutymate.api.domain.member.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import net.dutymate.api.domain.member.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

	Optional<Member> findMemberByEmail(String email);

	Boolean existsByNickname(String nickname);

	Boolean existsByEmail(String email);

	List<Member> findByEmailEndingWith(String suffix);

	long countByIsActiveTrue();

	// 총 자동생성 사용 횟수 합계 - 한 방 쿼리
	@Query("SELECT COALESCE(SUM(m.totalAutoGenUsed), 0) FROM Member m")
	long sumAllAutoGenUsed();

	// 최근 가입 회원 조회 with fetch join (N+1 방지)
	@Query("SELECT m FROM Member m LEFT JOIN FETCH m.wardMember wm LEFT JOIN FETCH wm.ward ORDER BY m.createdAt DESC")
	Page<Member> findAllWithWard(Pageable pageable);
}

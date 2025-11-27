package net.dutymate.api.domain.member.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.wardmember.Role;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

	Optional<Member> findMemberByEmail(String email);

	Boolean existsByNickname(String nickname);

	Boolean existsByEmail(String email);

	List<Member> findByEmailEndingWith(String suffix);

	@Query("SELECT COUNT(m) FROM Member m WHERE m.email NOT LIKE '%tempEmail@temp.com%' AND m.email NOT LIKE '%dutymate.demo%'")
	long countRealUsers();

	@Modifying
	@Query("update Member m set m.autoGenCnt = :cnt where m.role = :role and m.email not like :suffix")
	int updateAutoCnt(@Param("cnt") int cnt, @Param("role") Role role, @Param("suffix") String suffix);

	@Query(value = "SELECT DISTINCT m FROM Member m " +
		"LEFT JOIN m.wardMember wm " +
		"LEFT JOIN wm.ward w " +
		"WHERE m.email NOT LIKE '%tempEmail@temp.com%' " +
		"AND m.email NOT LIKE '%dutymate.demo%'",
		countQuery = "SELECT COUNT(DISTINCT m) FROM Member m " +
			"WHERE m.email NOT LIKE '%tempEmail@temp.com%' " +
			"AND m.email NOT LIKE '%dutymate.demo%'")
	Page<Member> findAllForAdminPage(Pageable pageable);

}

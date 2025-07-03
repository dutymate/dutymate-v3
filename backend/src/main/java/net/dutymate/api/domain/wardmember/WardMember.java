package net.dutymate.api.domain.wardmember;

import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import net.dutymate.api.domain.member.Member;
import net.dutymate.api.domain.request.Request;
import net.dutymate.api.domain.ward.Ward;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
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
public class WardMember {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long wardMemberId;

	// ManyToOne => wardMember : Ward = N : 1
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ward_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Ward ward;

	// OneToOne => WardMember : Member = 1 : 1
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	// OneToMany => wardMember : Request = 1 : N
	@OneToMany(mappedBy = "wardMember", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Request> requestList;

	@Column(nullable = false, columnDefinition = "int default 0")
	private Integer shiftFlags;

	@Column(length = 200)
	private String memo;

	@Column(length = 45)
	private String tempName;

	@Enumerated(EnumType.STRING)
	private SkillLevel skillLevel;

	@Enumerated(EnumType.STRING)
	private WorkIntensity workIntensity;

	@Column(columnDefinition = "tinyint(1)", nullable = false)
	private Boolean isSynced;

	public void updateWardMemberInfo(Integer shiftFlags, String skillLevel, String memo, String role,
		String workIntensity) {
		if (shiftFlags != null) {
			this.shiftFlags = shiftFlags;
		}
		if (skillLevel != null && !skillLevel.isEmpty()) {
			this.skillLevel = SkillLevel.valueOf(skillLevel);
		}
		if (memo != null) {
			this.memo = memo;
		}
		if (role != null && !role.isEmpty()) {
			this.member.updateRole(Role.valueOf(role));
		}
		if (workIntensity != null && !workIntensity.isEmpty()) {
			this.workIntensity = WorkIntensity.valueOf(workIntensity);
		}
	}

	public void changeIsSynced(boolean isSynced) {
		this.isSynced = isSynced;
	}

	public void changeMember(Member member) {
		this.member = member;
		member.setWardMember(this);
	}

	public void changeShiftFlags(Integer shiftFlags) {
		this.shiftFlags = shiftFlags;
	}

	@PrePersist
	protected void prePersist() {
		if (this.shiftFlags == null || this.shiftFlags == 0) {
			if (this.member.getRole() == Role.HN) {
				this.shiftFlags = ShiftType.M.getFlag();
			} else {
				this.shiftFlags = ShiftType.ALL.getFlag();
			}
		}
		if (this.workIntensity == null) {
			this.workIntensity = WorkIntensity.MEDIUM;
		}
	}
}

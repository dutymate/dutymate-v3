// import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
// import { Button } from '@/components/atoms/Button';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { useUserAuthStore } from '../../stores/userAuthStore';

interface NoticeDetail {
  noticeId: number;
  title: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
}

const NoticeDetailPage = () => {
  const navigate = useNavigate();
  const { noticeId } = useParams();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useUserAuthStore((state) => state.userInfo?.token);
  const email = useUserAuthStore((state) => state.userInfo?.email);
  const isAdmin = token && email === 'dutymate.net@gmail.com';

  useEffect(() => {
    axiosInstance.get(`/notice/${noticeId}`).then((res) => {
      setNotice(res.data);
      setLoading(false);
    });
  }, [noticeId]);

  //   useEffect(() => {
  //     if (noticeId) {
  //       // API 호출 대신 더미 데이터 사용
  //       const dummyNotices: Record<number, NoticeDetail> = {
  //         4: {
  //           noticeId: 4,
  //           title: '📢 듀티메이트 Ver.2.4.0 출시 안내',
  //           content: `안녕하세요! 듀티메이트의 새로운 업데이트 소식을 전해드립니다.

  // 1. 평간호사님, 이제 듀티표 직접 관리하세요 ✨
  // • 병동 입장 없이도 나의 듀티표 등록 가능
  // • 터치 한 번으로 근무 등록
  // • 근무별 색상 커스텀 설정
  // • 개인 일정도 함께 기록 가능

  // 2. 친구와 근무표 공유도 간편하게 👥
  // • 동료와 근무표 공유
  // • 모두 쉴 수 있는 날짜 자동 추천

  // 3. 자동 생성 기능이 더 똑똑해졌어요 🤖💡
  // • 공휴일 및 임시공휴일 자동 반영
  // • 반려된 요청 우선 반영
  // • 근무 강도 및 Off 일수 설정 가능
  // • 수간호사가 대신 요청 등록 가능

  // 📩 궁금한 점은 우측 하단 채널톡으로 편하게 문의 주세요! 😊`,
  //           createdAt: '2025-02-15T09:00:00.000Z',
  //           isPinned: true,
  //         },
  //         1: {
  //           noticeId: 1,
  //           title: '서비스 이용 안내',
  //           content: `듀티메이트 서비스 이용 안내입니다.

  // 1. 서비스 소개
  // 듀티메이트는 간호사와 병원을 위한 스케줄 관리 및 근무 관리 서비스입니다. 효율적인 근무 일정 관리와 원활한 커뮤니케이션을 제공합니다.

  // 2. 주요 기능 소개
  // 2.1 스케줄 관리
  // • 월간/주간/일간 스케줄 조회
  // • 근무 일정 등록 및 수정
  // • 근무 패턴 설정 및 관리
  // • 휴가 및 특별 근무 신청

  // 2.2 근무 관리
  // • 초과 근무 관리
  // • 휴가 잔여일 확인
  // • 근무 이력 조회

  // 2.3 커뮤니케이션
  // • 공지사항 확인
  // • 익명 커뮤니케이션

  // 2.4 통계 및 리포트
  // • 개인별 근무 통계
  // • 팀별 근무 현황
  // • 월간 근무표 파일일 생성
  // • 근무 패턴 분석

  // 3. 서비스 이용 방법
  // 3.1 회원가입
  // • 이메일 인증을 통한 가입
  // • 필수 정보 입력 (이름, 연차, 성별, 직위)

  // 3.2 로그인
  // • 이메일과 비밀번호로 로그인
  // • 비밀번호 찾기

  // 3.3 권한 설정
  // • 병원 관리자: 전체 기능 접근 가능
  // • 일반 사용자: 개인 스케줄 관리 및 조회 , 약속잡기 기능능

  // 4. 자주 묻는 질문
  // Q: 휴가 신청은 어떻게 하나요?
  // A: 나의 듀티표나 병동 듀티표 메뉴에서 근무 요청 버튼을 통해 등록해주시기 바랍니다.

  // 5. 고객 지원
  // • 이메일: dutymate.net@gmail.com
  // • 전화: 010-8610-8485
  // • 운영시간: 평일 09:00 - 18:00

  // 시행일: 2025-02-01`,
  //           createdAt: '2025-02-15T09:00:00.000Z',
  //           isPinned: false,
  //         },
  //         2: {
  //           noticeId: 2,
  //           title: '개인정보 처리방침',
  //           content: `듀티메이트(이하 "회사"라 합니다)는 이용자의 개인정보를 중요하게 여기며, 관련 법령을 준수하여 안전하게 보호하고 있습니다. 본 개인정보 처리방침은 회사가 운영하는 서비스에서 이용자의 개인정보를 수집, 이용, 보관, 보호하는 방법을 설명합니다.

  // 1. 총칙
  // 듀티메이트(이하 "회사"라 합니다)는 이용자의 개인정보를 중요하게 여기며, 관련 법령을 준수하여 안전하게 보호하고 있습니다. 본 개인정보 처리방침은 회사가 운영하는 서비스에서 이용자의 개인정보를 수집, 이용, 보관, 보호하는 방법을 설명합니다.

  // 2. 수집하는 개인정보 항목 및 수집 방법
  // 2.1 수집하는 개인정보 항목
  // 회사는 다음과 같은 개인정보를 수집할 수 있습니다.
  // • 필수 정보: 이메일, 비밀번호, 이름, 연차, 성별, 직위
  // • 선택 정보: 프로필 사진
  // • 자동 수집 정보: 서비스 이용 기록, 접속 로그, 쿠키, 기기 정보

  // 2.2 개인정보 수집 방법
  // • 서비스 가입 및 이용 과정에서 이용자가 직접 입력
  // • 자동화된 기술을 통한 수집 (쿠키 및 로그 분석 도구 활용)

  // 3. 개인정보의 이용 목적
  // • 회원 가입 및 관리
  // • 서비스 제공 및 운영
  // • 고객 문의 응대 및 기술 지원
  // • 서비스 개선 및 맞춤형 콘텐츠 제공
  // • 법적 의무 준수 및 보안 강화

  // 4. 개인정보의 보유 및 이용 기간
  // 회사는 이용자의 개인정보를 수집 및 이용 목적이 달성된 후 지체 없이 파기합니다. 단, 관련 법령에 따라 보존해야 하는 경우 일정 기간 동안 보관할 수 있습니다.
  // • 소비자 불만 및 분쟁 처리 기록: 3년 (전자상거래법)
  // • 로그 기록 및 접속 기록: 3개월 (통신비밀보호법)

  // 5. 개인정보의 제3자 제공
  // 회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
  // • 이용자가 사전에 동의한 경우
  // • 법령에 의해 요구되는 경우
  // • 서비스 제공을 위해 필요한 최소한의 정보 제공이 필요한 경우 (예: 결제 대행사, 클라우드 서비스 제공업체 등)

  // 6. 개인정보의 처리 위탁
  // 회사는 원활한 서비스 운영을 위해 일부 개인정보 처리를 외부에 위탁할 수 있습니다. 위탁 업체와 위탁하는 업무 내용은 아래와 같습니다.
  // • AWS (Amazon Web Services): 클라우드 서버 운영 및 데이터 보관

  // 회사는 위탁 계약 시 개인정보 보호를 위한 기술적·관리적 조치를 마련하고 있습니다.

  // 7. 이용자의 권리 및 행사 방법
  // 이용자는 언제든지 본인의 개인정보를 조회하거나 수정할 수 있으며, 삭제 및 처리 정지를 요청할 수 있습니다. 이를 위해 서비스 내 설정 메뉴 또는 고객센터를 통해 요청할 수 있습니다.

  // 8. 개인정보 보호를 위한 조치
  // • 기술적 보호 조치: 암호화 저장, 방화벽 및 침입 탐지 시스템 운영
  // • 관리적 보호 조치: 개인정보 접근 권한 제한, 정기적인 보안 교육 실시
  // • 물리적 보호 조치: 서버 및 데이터센터 접근 통제

  // 9. 개인정보 보호 책임자 및 연락처
  // 회사는 이용자의 개인정보 보호를 위해 책임자를 지정하고 있으며, 개인정보 보호와 관련한 문의사항은 아래 연락처를 통해 접수할 수 있습니다.
  // • 개인정보 보호 책임자: 한종우
  // • 이메일: jongwooo.han@gmail.com
  // • 연락처: 010-8610-8485

  // 10. 개정 및 공지
  // 본 개인정보 처리방침은 관련 법령 및 내부 정책에 따라 변경될 수 있으며, 변경 사항은 서비스 내 공지사항을 통해 사전에 안내드립니다.

  // 시행일: 2025-01-02`,
  //           createdAt: '2025-02-01T09:00:00.000Z',
  //           isPinned: false,
  //         },
  //         3: {
  //           noticeId: 3,
  //           title: '이용약관',
  //           content: `듀티메이트 이용약관입니다.

  // 제1장 총칙

  // 제1조 (목적)
  // 본 약관은 듀티메이트(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

  // 제2조 (정의)
  // 1. "서비스"란 회사가 제공하는 스케줄 관리 및 근무 관리 서비스를 말합니다.
  // 2. "이용자"란 회사의 서비스를 이용하는 회원을 말합니다.
  // 3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자를 말합니다.

  // 제3조 (약관의 효력 및 변경)
  // 1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.
  // 2. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항에 게시함으로써 효력이 발생합니다.

  // 제2장 서비스 이용

  // 제4조 (서비스의 제공)
  // 1. 회사는 다음과 같은 서비스를 제공합니다:
  //    - 스케줄 관리 서비스
  //    - 근무 관리 서비스
  //    - 커뮤니케이션 서비스
  //    - 통계 및 리포트 서비스

  // 2. 회사는 서비스의 내용 및 제공일을 회원에게 사전 통지하고, 서비스를 변경하여 제공할 수 있습니다.

  // 제5조 (서비스 이용 시간)
  // 1. 서비스는 연중무휴, 1일 24시간 제공을 원칙으로 합니다.
  // 2. 회사는 서비스의 제공에 필요한 경우 정기점검을 실시할 수 있으며, 정기점검시간은 서비스제공화면에 공지한 바에 따릅니다.

  // 제3장 회원의 권리와 의무

  // 제6조 (회원의 의무)
  // 1. 회원은 다음 행위를 하여서는 안 됩니다:
  //    - 서비스 이용을 방해하는 행위
  //    - 타인의 개인정보를 도용하는 행위
  //    - 허위 정보를 등록하는 행위
  //    - 서비스의 정상적인 운영을 방해하는 행위

  // 2. 회원은 관계법령, 본 약관의 규정, 이용안내 및 주의사항 등 회사가 통지하는 사항을 준수하여야 합니다.

  // 제7조 (회원의 권리)
  // 1. 회원은 서비스 이용을 통해 자신의 스케줄을 관리할 수 있습니다.
  // 2. 회원은 서비스 내에서 제공되는 통계 및 리포트를 확인할 수 있습니다.
  // 3. 회원은 서비스 이용과 관련하여 회사에 개선사항을 제안할 수 있습니다.

  // 제4장 서비스 제공자의 의무

  // 제8조 (서비스 제공자의 의무)
  // 1. 회사는 안정적인 서비스 제공을 위해 최선을 다합니다.
  // 2. 회사는 회원의 개인정보를 보호하기 위해 보안시스템을 갖추고 개인정보처리방침을 공시하고 준수합니다.
  // 3. 회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우 이를 처리하여야 합니다.

  // 제5장 기타

  // 제9조 (책임제한)
  // 1. 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적인 사유로 인한 서비스 중단에 대하여 책임을 지지 않습니다.
  // 2. 회사는 서비스 이용과 관련하여 회원의 귀책사유로 인한 손해에 대하여 책임을 지지 않습니다.

  // 제10조 (분쟁해결)
  // 1. 회사와 회원 간 발생한 분쟁은 상호 협의하여 해결합니다.
  // 2. 협의가 이루어지지 않을 경우, 관련 법령 및 상관례에 따릅니다.

  // 시행일: 2025-02-01`,
  //           createdAt: '2025-02-01T09:00:00.000Z',
  //           isPinned: false,
  //         },
  //       };

  //       const selectedNotice = dummyNotices[Number(noticeId)];
  //       if (selectedNotice) {
  //         setNotice(selectedNotice);
  //       }
  //       setLoading(false);
  //     }
  //   }, [noticeId]);

  const handleDelete = async () => {
    if (!noticeId) return;

    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/notice/${noticeId}`);
        toast.success('공지사항이 삭제되었습니다.');
        navigate('/notice');
      } catch (err) {
        console.error('공지사항 삭제 실패:', err);
        toast.error('공지사항 삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/notice/${noticeId}/edit`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-2 text-center">로딩 중...</div>
    );
  }

  if (!notice) {
    return (
      <div className="container mx-auto px-4 py-2">
        <button
          onClick={() => navigate('/notice')}
          className="mb-4 text-primary flex items-center gap-2"
        >
          <FaChevronLeft /> <span>목록으로</span>
        </button>
        <div className="text-center text-gray-500">
          공지사항을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-2 max-w-3xl">
      <div className="relative mb-6 h-16 flex items-center justify-center">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-700 hover:text-primary sm:w-10 sm:h-10"
          onClick={() => navigate('/notice')}
          aria-label="뒤로가기"
        >
          <FaChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mx-auto">
          공지사항
        </h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {notice.isPinned && (
              <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded whitespace-nowrap">
                중요
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-800 break-words overflow-hidden">
              {notice.title}
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(notice.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="prose max-w-none">
          <div
            className="whitespace-pre-line text-gray-700 break-words overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(notice.content || ''),
            }}
          />
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-2 mt-4 justify-end">
          <button
            type="button"
            className="flex items-center justify-center gap-1 px-6 py-2 sm:px-8 sm:py-2
             bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm
             text-sm sm:text-base text-gray-700"
            onClick={handleEdit}
          >
            수정
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1 px-6 py-2 sm:px-8 sm:py-2
             bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm
             text-sm sm:text-base text-white"
            onClick={handleDelete}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticeDetailPage;

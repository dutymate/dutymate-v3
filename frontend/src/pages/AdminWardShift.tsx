import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { SEO } from '@/components/SEO';
import PageLoadingSpinner from '@/components/atoms/Loadingspinner';
import ShiftAdminTable from '@/components/organisms/ShiftAdminTable';
import { adminService } from '@/services/adminService';
import type { DutyInfo } from '@/services/dutyService';

const AdminWardShift = () => {
  const { wardId } = useParams<{ wardId: string }>();
  const navigate = useNavigate();
  const [dutyInfo, setDutyInfo] = useState<DutyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWardDuty = useCallback(
    async (year?: number, month?: number, historyIdx?: number) => {
      if (!wardId) return;

      try {
        setLoading(true);
        const data = await adminService.getWardDuty(parseInt(wardId), year, month, historyIdx);
        setDutyInfo(data);
        setError(null);
      } catch (err) {
        setError('병동 스케줄 정보를 불러오는데 실패했습니다.');
        toast.error('병동 스케줄 정보를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [wardId]
  );

  useEffect(() => {
    if (!wardId) {
      navigate('/admin/wards');
      return;
    }

    fetchWardDuty();
  }, [wardId, navigate, fetchWardDuty]);

  if (loading && !dutyInfo) {
    return <PageLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  if (!dutyInfo) return null;

  return (
    <>
      <SEO title={`병동 스케줄 관리 | Dutymate`} description="관리자용 병동 스케줄 관리 페이지" />
      <div className="min-h-screen bg-[#F4F4F4] p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* 헤더 */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/wards')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← 병동 목록
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">병동 스케줄 관리</h1>
              <p className="text-sm text-gray-500 mt-1">관리자 전용 - 병동 ID: {wardId}</p>
            </div>
          </div>

          {/* 스케줄 테이블 - 읽기 전용 */}
          <div className="flex flex-col gap-4 pb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-yellow-800">
                ⚠️ 관리자 모드: 조회 전용입니다. 수정이 필요한 경우 해당 병동의 수간호사 계정으로
                로그인하세요.
              </p>
            </div>
            <div
              className="relative"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
              onKeyDown={(e) => e.preventDefault()}
              onKeyPress={(e) => e.preventDefault()}
              onKeyUp={(e) => e.preventDefault()}
            >
              <ShiftAdminTable
                dutyData={dutyInfo.duty}
                invalidCnt={dutyInfo.invalidCnt}
                year={dutyInfo.year}
                month={dutyInfo.month}
                onUpdate={fetchWardDuty}
                issues={dutyInfo.issues}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminWardShift;

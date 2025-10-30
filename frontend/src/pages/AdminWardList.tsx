import { type DashboardStats, type WardSummary, adminService } from '@/services/adminService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminWardList = () => {
  const navigate = useNavigate();
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingWard, setEditingWard] = useState<WardSummary | null>(null);
  const [maxNurseCount, setMaxNurseCount] = useState(0);
  const [maxTempNurseCount, setMaxTempNurseCount] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchWards(currentPage);
    fetchDashboardStats();
  }, [currentPage]);

  const fetchWards = async (page: number) => {
    try {
      setLoading(true);
      const response = await adminService.getAllWards(page, 20);
      setWards(response.wards);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError('병동 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setDashboardStats(data);
    } catch (err) {
      console.error('대시보드 통계 조회 실패:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleWardClick = (wardId: number) => {
    navigate(`/admin/wards/${wardId}/shift`);
  };

  const handleEditClick = (e: React.MouseEvent, ward: WardSummary) => {
    e.stopPropagation();
    setEditingWard(ward);
    setMaxNurseCount(ward.maxNurseCount);
    setMaxTempNurseCount(ward.maxTempNurseCount);
  };

  const handleCloseModal = () => {
    setEditingWard(null);
    setMaxNurseCount(0);
    setMaxTempNurseCount(0);
  };

  const handleUpdateCapacity = async () => {
    if (!editingWard) return;

    try {
      setUpdating(true);
      await adminService.updateWardCapacity(editingWard.wardId, maxNurseCount, maxTempNurseCount);
      // 성공 시 목록 새로고침
      await fetchWards(currentPage);
      handleCloseModal();
    } catch (err) {
      alert('병동 정보 업데이트에 실패했습니다.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">병동 관리</h1>
          <div className="text-sm text-gray-600">
            총 <span className="font-semibold text-gray-800">{totalElements}</span>개 병동
          </div>
        </div>

        {/* 서비스 운영 현황 대시보드 */}
        {dashboardStats && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">서비스 운영 현황</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
                <div className="text-sm opacity-90 mb-1">실제 유저 수</div>
                <div className="text-3xl font-bold">
                  {dashboardStats.totalUsers.toLocaleString()}
                </div>
                <div className="text-xs opacity-75 mt-1">tempEmail 제외</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
                <div className="text-sm opacity-90 mb-1">총 병동 수</div>
                <div className="text-3xl font-bold">
                  {dashboardStats.totalWards.toLocaleString()}
                </div>
                <div className="text-xs opacity-75 mt-1">운영 중인 병동</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
                <div className="text-sm opacity-90 mb-1">어제 로그인 유저</div>
                <div className="text-3xl font-bold">
                  {dashboardStats.yesterdayLoginCount.toLocaleString()}
                </div>
                <div className="text-xs opacity-75 mt-1">S3 로그 기반 (준비중)</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    병동 ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    병동 코드
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    병원명
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    병동명
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    간호사 수
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    최대 간호사
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    최대 임시간호사
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      등록된 병동이 없습니다.
                    </td>
                  </tr>
                ) : (
                  wards.map((ward) => (
                    <tr
                      key={ward.wardId}
                      onClick={() => handleWardClick(ward.wardId)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">{ward.wardId}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                          {ward.wardCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ward.hospitalName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ward.wardName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                          {ward.nursesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          {ward.maxNurseCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                          {ward.maxTempNurseCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => handleEditClick(e, ward)}
                          className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          수정
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                처음
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {currentPage + 1} / {totalPages} 페이지
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                다음
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                마지막
              </button>
            </div>
          </div>
        </div>

        {/* 수정 모달 */}
        {editingWard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">병동 정원 수정</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  병동: {editingWard.hospitalName} - {editingWard.wardName}
                </p>
                <p className="text-sm text-gray-500 mb-4">병동 코드: {editingWard.wardCode}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 간호사 수
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxNurseCount}
                    onChange={(e) => setMaxNurseCount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 임시 간호사 수
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxTempNurseCount}
                    onChange={(e) => setMaxTempNurseCount(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseModal}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateCapacity}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWardList;

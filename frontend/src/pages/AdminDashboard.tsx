import axios from '@/lib/axios';
import { useEffect, useState } from 'react';

// Type definitions matching backend DTO
interface MemberStatDto {
  memberId: number;
  email: string;
  name: string;
  role: string;
  autoGenCnt: number;
  createdAt: string;
  lastLoginAt: string;
  wardName: string;
}

interface WardStatDto {
  wardId: number;
  wardName: string;
  hospitalName: string;
  nurseCount: number;
  headNurseCount: number;
}

interface AdminStatistics {
  totalMembers: number;
  totalWards: number;
  totalNurses: number;
  totalHeadNurses: number;
  totalActiveMembers: number;
  totalAutoScheduleGenerated: number;
  recentMembers: MemberStatDto[];
  wardStats: WardStatDto[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchStatistics(currentPage);
  }, [currentPage]);

  const fetchStatistics = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/statistics', {
        params: { page, size: 20 },
      });
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('통계 데이터를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-lg text-gray-600">데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">관리자 대시보드</h1>

        {/* 전체 통계 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">전체 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">전체 회원 수</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalMembers}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">활성 회원 수</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalActiveMembers}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">전체 병동 수</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalWards}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">일반 간호사</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalNurses}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">수간호사</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalHeadNurses}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-sm text-gray-500 mb-2">총 자동생성 횟수</div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.totalAutoScheduleGenerated}
              </div>
            </div>
          </div>
        </section>

        {/* 최근 가입 회원 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            최근 가입 회원{' '}
            <span className="text-base font-normal text-gray-500">
              (총 {stats.totalElements}명)
            </span>
          </h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      이메일
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      이름
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      역할
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      자동생성
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      가입일
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      마지막 로그인
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      소속 병동
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentMembers.map((member) => (
                    <tr key={member.memberId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{member.memberId}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.autoGenCnt}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.createdAt}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.lastLoginAt}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.wardName}</td>
                    </tr>
                  ))}
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
                  {currentPage + 1} / {stats.totalPages} 페이지
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= stats.totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  다음
                </button>
                <button
                  onClick={() => handlePageChange(stats.totalPages - 1)}
                  disabled={currentPage >= stats.totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  마지막
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 병동별 통계 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-6">병동별 통계</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      병동ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      병원명
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      병동명
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      일반 간호사
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      수간호사
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.wardStats.map((ward) => (
                    <tr key={ward.wardId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{ward.wardId}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ward.hospitalName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ward.wardName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ward.nurseCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{ward.headNurseCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

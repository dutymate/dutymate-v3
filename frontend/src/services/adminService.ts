import axiosInstance from '@/lib/axios';
import type { DutyInfo } from './dutyService';

export interface WardSummary {
  wardId: number;
  wardCode: string;
  wardName: string;
  hospitalName: string;
  nursesCount: number;
  maxNurseCount: number;
  maxTempNurseCount: number;
}

export interface WardListResponse {
  wards: WardSummary[];
  totalElements: number;
  currentPage: number;
  totalPages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalWards: number;
  yesterdayLoginCount: number;
}

export const adminService = {
  /**
   * 전체 병동 리스트 조회 (관리자 전용)
   * @param page - 페이지 번호 (0부터 시작)
   * @param size - 페이지당 항목 수
   * @returns 병동 리스트
   */
  getAllWards: (page = 0, size = 20) => {
    return axiosInstance
      .get<WardListResponse>('/admin/statics', {
        params: { page, size },
      })
      .then((response) => response.data)
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
              break;
            case 403:
              alert('관리자 권한이 필요합니다.');
              window.location.href = '/';
              break;
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },

  /**
   * 특정 병동의 듀티 정보 조회 (관리자 전용)
   * @param wardId - 병동 ID
   * @param year - 년도 (선택)
   * @param month - 월 (선택)
   * @param history - 히스토리 인덱스 (선택)
   * @returns 병동 듀티 정보
   */
  getWardDuty: (wardId: number, year?: number, month?: number, history?: number) => {
    return axiosInstance
      .get<DutyInfo>(`/admin/wards/${wardId}/duty`, {
        params: { year, month, history },
      })
      .then((response) => response.data)
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
              break;
            case 403:
              alert('관리자 권한이 필요합니다.');
              window.location.href = '/';
              break;
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },

  /**
   * 병동의 최대 간호사 수 업데이트 (관리자 전용)
   * @param wardId - 병동 ID
   * @param maxNurseCount - 최대 간호사 수
   * @param maxTempNurseCount - 최대 임시 간호사 수
   */
  updateWardCapacity: (wardId: number, maxNurseCount: number, maxTempNurseCount: number) => {
    return axiosInstance
      .patch(`/admin/wards/${wardId}/capacity`, {
        maxNurseCount,
        maxTempNurseCount,
      })
      .then((response) => response.data)
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
              break;
            case 403:
              alert('관리자 권한이 필요합니다.');
              window.location.href = '/';
              break;
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },

  /**
   * 대시보드 통계 조회 (관리자 전용)
   * @returns 대시보드 통계 (유저 수, 병동 수, 어제 로그인 수)
   */
  getDashboardStats: () => {
    return axiosInstance
      .get<DashboardStats>('/admin/dashboard/stats')
      .then((response) => response.data)
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
              break;
            case 403:
              alert('관리자 권한이 필요합니다.');
              window.location.href = '/';
              break;
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },
};

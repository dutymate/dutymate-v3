import axiosInstance from '@/lib/axios';

// 타입 정의
export interface WardRequest {
  requestId: number;
  memberId: number;
  name: string;
  date: string;
  shift: 'D' | 'E' | 'N' | 'O';
  memo: string;
  status: 'ACCEPTED' | 'DENIED' | 'HOLD';
  createdAt: string;
}

export interface MyRequest {
  requestId: number;
  date: string;
  shift: 'D' | 'E' | 'N' | 'O';
  memo: string;
  status: 'ACCEPTED' | 'DENIED' | 'HOLD';
}

export interface CreateRequestDto {
  date: string; // YYYY-MM-DD 형식
  shift: 'D' | 'E' | 'N' | 'O';
  memo: string;
}

export interface CreateRequestByAdminDto {
  memberId: number;
  date: string; // YYYY-MM-DD 형식
  shift: 'D' | 'E' | 'N' | 'O';
  memo: string;
}

export interface EditRequestStatusDto {
  memberId: number;
  status: 'ACCEPTED' | 'DENIED' | 'HOLD';
}

// API 서비스
export const requestService = {
  /**
   * 병동 근무 요청 내역 조회 (수간호사용)
   * 현재 요청 상태에 따라 승인/거절/대기 데이터를 반환
   * @returns 병동의 모든 근무 요청 내역
   */
  getWardRequests: async () => {
    try {
      const response = await axiosInstance.get('/ward/request');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('서버 연결 실패');
      }
      if (error.response) {
        switch (error.response.status) {
          case 401:
            window.location.href = '/login';
            break;
          default:
            console.error('Error occurred:', error);
            window.location.href = '/error';
            break;
        }
      }
      throw error;
    }
  },

  getWardRequestsByDate: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    return axiosInstance
      .get(`/ward/request/date?${params.toString()}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error(
            '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          );
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
              break;
            default:
              console.error('Error occurred:', error);
              window.location.href = '/error';
              break;
          }
        }
        throw error;
      });
  },

  /**
   * 대기 중인 근무 요청 개수 조회 (수간호사용)
   * @returns 대기 중인 근무 요청 개수
   */
  getPendingRequestCount: async () => {
    try {
      const requests = await requestService.getWardRequests();
      return requests.filter(
        (request: WardRequest) => request.status === 'HOLD'
      ).length;
    } catch (error) {
      console.error('Failed to get pending request count:', error);
      return 0;
    }
  },

  /**
   * 나의 근무 요청 내역 조회
   * @returns 내가 신청한 근무 요청 내역
   */
  getMyRequests: () => {
    return axiosInstance
      .get('/request')
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error(
            '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          );
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
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
   * 근무 변경 요청하기
   * @param data - 요청할 근무 정보 (날짜, 근무 유형, 메모)
   */
  createRequest: (data: CreateRequestDto) => {
    return axiosInstance
      .post(`/request`, data)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error(
            '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          );
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
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
   * 근무 요청 상태 변경
   * @param requestId - 요청 ID
   * @param data - 상태 변경 정보 (회원 ID, 변경할 상태)
   */
  editRequestStatus: (requestId: number, data: EditRequestStatusDto) => {
    return axiosInstance
      .put(`/ward/request/${requestId}`, data)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error(
            '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          );
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
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
   * 근무 요청 삭제
   * @param requestId - 삭제할 요청 ID
   */
  deleteRequest: (requestId: number) => {
    return axiosInstance
      .delete(`/request/${requestId}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error(
            '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          );
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
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
   * 관리자가 다른 간호사를 대신해 근무 요청 생성
   * @param data - 요청할 근무 정보 (회원 ID, 날짜, 근무 유형, 메모)
   */
  createRequestByAdmin: (data: CreateRequestByAdminDto) => {
    return axiosInstance
      .post(`/request/admin`, data)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          console.error(
            '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
          );
          throw new Error('서버 연결 실패');
        }
        if (error.response) {
          switch (error.response.status) {
            case 401:
              window.location.href = '/login';
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

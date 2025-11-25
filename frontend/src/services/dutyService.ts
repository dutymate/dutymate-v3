import axiosInstance from '@/lib/axios';
import { Calendar } from '@/types/calendar';
import axios from 'axios';

// 타입 정의
export interface DayDuty {
  myShift: 'D' | 'E' | 'N' | 'O' | 'M';
  otherShifts: {
    grade: number;
    name: string;
    shift: 'D' | 'E' | 'N' | 'O' | 'M';
  }[];
}

export interface MyDuty {
  year: number;
  month: number;
  prevShifts: string; // 전달 일주일
  nextShifts: string; // 다음달 일주일
  shifts: string; // 이번달 근무표
  calendar: Calendar;
}

export interface DutyHistory {
  idx: number;
  memberId: number;
  name: string;
  before: string;
  after: string;
  modifiedDay: number;
  isAutoCreated: boolean;
}

export interface DutyIssue {
  memberId: number;
  name: string;
  startDate: number;
  endDate: number;
  endDateShift: string;
  message: string;
}

export interface WardDuty {
  id: string;
  year: number;
  month: number;
  duty: {
    memberId: number;
    name: string;
    shifts: string;
    role: 'HN' | 'RN';
    shiftType: 'M' | 'N' | 'All';
    grade: number;
  }[];
}

export interface DutyInfo {
  id: string;
  year: number;
  month: number;
  invalidCnt: number;
  duty: {
    memberId: number;
    name: string;
    role: 'HN' | 'RN';
    prevShifts: string;
    shifts: string;
    shiftType: 'M' | 'N' | 'All';
    grade: number;
  }[];
  issues: DutyIssue[];
  histories: DutyHistory[];
  nurseOrder: number[];
}

export interface DutyUpdateRequest {
  year: number;
  month: number;
  history: {
    memberId: number;
    name: string;
    before: string;
    after: string;
    modifiedDay: number;
    isAutoCreated: boolean;
  };
}

// 개인 근무표 수정 요청 인터페이스
export interface EditMemberDutyRequestDto {
  year: number;
  month: number;
  day: number;
  shift: 'D' | 'E' | 'N' | 'O' | 'X' | 'M';
}

export interface UnreflectedRequest {
  requestId: number;
  memberId: number;
  memberName: string;
  requestDate: string;
  requestShift: string;
  actualShift: string;
  requestMemo: string;
}

export interface AutoCreateResponse {
  message: string;
  unreflectedRequestsCount: number;
  unreflectedRequests: UnreflectedRequest[];
  success: boolean;
}

export type SubscriptionPlan = 'monthly' | 'quarterly' | 'yearly';

// 간호사 순서 업데이트 인터페이스 추가
export interface NurseOrderUpdate {
  year: number;
  month: number;
  nurseOrder: number[];
}

// API 서비스
export const dutyService = {
  /**
   * 특정 날짜 근무 조회
   * @param year - 년도
   * @param month - 월
   * @param date - 일
   */
  getMyDayDuty: (year: number, month: number, date: number) => {
    return axiosInstance
      .get('/duty/my/date', {
        params: { year, month, date },
      })
      .then((response) => {
        return response.data as DayDuty;
      })
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
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },

  /**
   * 나의 근무표 조회
   * @param year - 년도 (선택)
   * @param month - 월 (선택)
   */
  getMyDuty: (year?: number, month?: number) => {
    const params = year && month ? { year, month } : {};
    return axiosInstance
      .get('/duty/my', { params })
      .then((response) => {
        return response.data as MyDuty;
      })
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
            case 400:
              throw new Error(error.response.data.message);
            default:
              throw new Error(error.response.data.message);
          }
        }
        throw error;
      });
  },

  /**
   * 병동 근무표 조회
   * @returns 병동의 전체 근무표 정보
   */
  getWardDuty: (year?: number, month?: number) => {
    const params = year && month ? { year, month } : {};
    return axiosInstance
      .get('/duty/ward', { params })
      .then((response) => {
        return response.data;
      })
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
            case 400:
              throw new Error(error.response.data.message);
            default:
              window.location.href = '/error';
              break;
          }
        }
        throw error;
      });
  },

  /**
   * 근무표 자동 생성
   * @param year - 년도
   * @param month - 월
   * @param force - 강제 자동생성 여부
   * @param priorityRequestIds - 우선순위를 부여할 요청 ID 배열 (선택사항)
   * @returns AutoCreateResponse - 자동 생성 결과 (반영되지 않은 요청 목록 포함)
   */
  autoCreateDuty: (year: number, month: number, force?: boolean, priorityRequestIds?: number[]) => {
    return axiosInstance
      .get('/duty/auto-create', {
        params: {
          year,
          month,
          force,
          priorityRequestIds: priorityRequestIds?.join(','),
        },
        timeout: 300000,
      })
      .then((response) => {
        return response.data as AutoCreateResponse;
      })
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
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },

  /**
   * 근무표 수정
   * @param data - 수정할 근무 정보
   */
  updateDuty: (data: DutyUpdateRequest) => {
    return axiosInstance
      .put(`/duty`, data)
      .then((response) => {
        return response.data;
      })
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
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },

  /**
   * 근무표 조회/되돌리기
   * @param params - 조회할 근무표 정보 (year, month, history)
   */
  getDuty: (params: { year?: number; month?: number; history?: number }) => {
    return axiosInstance
      .get('/duty', { params })
      .then((response) => {
        return applyNurseOrder(response.data as DutyInfo); // 정렬 후 반환
      })
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
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },

  /**
   * 근무표 초기화하기
   * @param year - 년도
   * @param month - 월
   */
  resetDuty: (year: number, month: number) => {
    return axiosInstance
      .post('/duty/reset', null, {
        params: { year, month },
      })
      .then((response) => {
        return response.data;
      })
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
            default:
              console.error('Error occurred:', error);
              throw error;
          }
        }
        throw error;
      });
  },

  /**
   * 개인 근무표 수정 API
   * @param data - 개인 근무표 수정 데이터
   */
  updateMyDuty: async (data: EditMemberDutyRequestDto) => {
    try {
      const response = await axiosInstance.put('/duty/my', data);
      return response.data;
    } catch (error) {
      console.error('개인 근무표 수정 실패:', error);
      throw error;
    }
  },

  updateShiftBatch: async (requests: any[]) => {
    try {
      const response = await axiosInstance.put('/duty', requests);
      return response.data;
    } catch (error) {
      console.error('Failed to update shifts:', error);
      throw error;
    }
  },

  getAutoGenCount: async () => {
    try {
      const response = await axiosInstance.get('/payment');
      return response.data.autoGenCnt;
    } catch (error) {
      console.error('자동 생성 횟수 조회 실패:', error);
      throw error;
    }
  },

  // 구독 API 호출 함수 추가
  subscribe: async () => {
    try {
      const response = await axiosInstance.patch('/payment');
      return response.data;
    } catch (error) {
      console.error('구독 처리 중 오류 발생:', error);
      throw error;
    }
  },

  /**
   * 반영되지 않은 요청 재반영 API
   * @param year - 년도
   * @param month - 월
   * @param requestIds - 재반영할 요청 ID 목록
   * @returns AutoCreateResponse - 자동 생성 결과 (반영되지 않은 요청 목록 포함)
   */
  reAutoCreateDuty: async (year: number, month: number, requestIds: number[]) => {
    try {
      const response = await axiosInstance.post(
        '/duty/re-auto-create',
        {
          year,
          month,
          requestIds,
        },
        {
          timeout: 300000,
        }
      );
      return response.data as AutoCreateResponse;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        console.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
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
    }
  },

  updateDutyColors: async (colors: any) => {
    try {
      const response = await axiosInstance.put('/duty/color', colors);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw error.response?.data;
      }
      throw error;
    }
  },

  /**
   * 간호사 표시 순서 업데이트
   * @param nurseOrders - 업데이트할 간호사 순서 배열
   */
  updateNurseOrder: async (nurseOrder: NurseOrderUpdate) => {
    try {
      const response = await axiosInstance.put('/duty/nurse-order', nurseOrder);
      return response.data;
    } catch (error) {
      console.error('간호사 순서 업데이트 실패:', error);
      if (axios.isAxiosError(error)) {
        throw error.response?.data;
      }
      throw error;
    }
  },
};

/**
 * 간호사 순서(nurseOrder)를 기반으로 duty 배열을 정렬합니다.
 *
 * - nurseOrder에 포함된 ID 중 현재 duty 목록에 존재하는 ID만 유지합니다.
 * - nurseOrder에 없는 새로운 간호사 ID는 맨 뒤에 추가합니다.
 * - 최종적으로 정렬된 duty 배열을 포함한 새로운 DutyInfo 객체를 반환합니다.
 *
 * @param dutyInfo - 서버에서 내려온 전체 근무표 정보
 * @returns duty 배열이 nurseOrder 기준으로 정렬된 DutyInfo 객체
 */
function applyNurseOrder(dutyInfo: DutyInfo): DutyInfo {
  const orderData = dutyInfo.nurseOrder; // ex) [1, 2, 3, 4]
  const dutyData = dutyInfo.duty; // 간호사 배열

  // nurseOrder가 null, undefined, 빈 배열이면 정렬하지 않고 그대로 반환
  if (!orderData || orderData.length === 0) {
    return dutyInfo;
  }

  // 간호사 memberId 목록
  const currentNurseIds = dutyData.map((n) => n.memberId);

  // 순서 배열 중 실제 존재하는 ID만
  const validOrderIds = orderData.filter((id) => currentNurseIds.includes(id));

  // 새로 추가된 간호사 (order에 없음)
  const newNurseIds = currentNurseIds.filter((id) => !validOrderIds.includes(id));

  // 최종 순서 = 서버 제공 순서 + 신규 간호사
  const finalOrder = [...validOrderIds, ...newNurseIds];

  // 순서에 따라 duty 정렬
  const orderedDuty = finalOrder
    .map((id) => dutyData.find((n) => n.memberId === id))
    .filter(Boolean) as typeof dutyData;

  return {
    ...dutyInfo,
    duty: orderedDuty,
  };
}

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 사용자 기본 정보 타입
interface UserInfo {
  token: string;
  memberId: number;
  email: string;
  name: string;
  role: string | null;
  provider: string;
  profileImg: string | null;
  existAdditionalInfo: boolean;
  existMyWard: boolean;
  sentWardCode: boolean;
  isDemo?: boolean; //데모 계정 여부 추가
  color?: ColorTheme;
}

// 색상 테마 타입
export interface ColorTheme {
  dayBg: string;
  dayText: string;
  eveningBg: string;
  eveningText: string;
  nightBg: string;
  nightText: string;
  offBg: string;
  offText: string;
  midBg: string;
  midText: string;
}

// 부가 정보 타입
interface AdditionalInfo {
  grade: number;
  gender: 'F' | 'M';
  role: 'RN' | 'HN'; // RN: 평간호사, HN: 수간호사
}

// 스토어 상태 타입
interface UserAuthState {
  // 상태
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  additionalInfo: AdditionalInfo | null;
  isTimeout: boolean;
  timeLeft: number;

  // 액션
  setUserInfo: (userInfo: UserInfo) => void;
  setAdditionalInfo: (additionalInfo: AdditionalInfo) => void;
  logout: () => void;
  setProfileImg: (profileImgUrl: string | null) => void;
  setTimeout: (isTimeout: boolean) => void;
  setTimeLeft: (timeLeft: number) => void;
}

// Zustand 스토어 생성
export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isAuthenticated: false,
      userInfo: null,
      additionalInfo: null,
      isTimeout: false,
      timeLeft: 0,

      // 액션
      setUserInfo: (userInfo: UserInfo) => {
        set({
          isAuthenticated: true,
          userInfo,
        });
      },

      setAdditionalInfo: (additionalInfo: AdditionalInfo) => {
        const currentState = get();
        // userInfo가 없거나 인증되지 않은 상태라면 에러
        if (!currentState.isAuthenticated || !currentState.userInfo) {
          throw new Error(
            'User must be authenticated before setting additional info'
          );
        }

        set({
          additionalInfo,
          userInfo: {
            ...currentState.userInfo,
            existAdditionalInfo: true,
          },
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          userInfo: null,
          additionalInfo: null,
          timeLeft: 0,
        }),
          sessionStorage.removeItem('user-auth-storage');
      },

      setProfileImg: (profileImgUrl: string | null) => {
        const currentState = get();
        // userInfo가 없거나 인증되지 않은 상태라면 에러
        if (!currentState.isAuthenticated || !currentState.userInfo) {
          throw new Error(
            'User must be authenticated before setting additional info'
          );
        }
        set({
          userInfo: {
            ...currentState.userInfo,
            profileImg: profileImgUrl,
          },
        });
      },

      setTimeout: (isTimeout: boolean) => set({ isTimeout }),
      setTimeLeft: (timeLeft: number) => set({ timeLeft }),
    }),
    {
      name: 'user-auth-storage',
      storage: createJSONStorage(() => sessionStorage), // localStorage 대신 sessionStorage 사용
    }
  )
);

export default useUserAuthStore;

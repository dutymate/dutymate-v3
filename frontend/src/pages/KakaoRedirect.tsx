import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import PageLoadingSpinner from '@/components/atoms/Loadingspinner';
import { SEO } from '@/components/SEO';
import {
  ApiErrorResponse,
  LoginResponse,
  userService,
} from '@/services/userService';
import { useLoadingStore } from '@/stores/loadingStore';
import useUserAuthStore from '@/stores/userAuthStore';

export function KakaoRedirect() {
  const navigate = useNavigate();
  const userAuthStore = useUserAuthStore();
  const code: string | null = new URL(window.location.href).searchParams.get(
    'code'
  );

  useEffect(() => {
    if (!code) {
      console.error('Authorization code is missing.');
      navigate('/login');
      return;
    }

    useLoadingStore.getState().setLoading(true);

    userService.kakaoLogin(
      code,
      (data: LoginResponse) => {
        useLoadingStore.getState().setLoading(false);
        const { role, existAdditionalInfo, existMyWard } = data;
        userAuthStore.setUserInfo({
          ...data,
          provider: 'kakao',
          email: data.email,
          token: data.token,
        });

        const inviteToken = localStorage.getItem('inviteToken');
        if (inviteToken) {
          toast.success('정상적으로 로그인되었습니다.');
          navigate(`/invite/${inviteToken}`);
          localStorage.removeItem('inviteToken');
          return;
        }

        // 로그인 후 이동 로직
        if (!existAdditionalInfo) {
          navigate('/extra-info');
        } else if (!existMyWard) {
          if (role === 'HN') {
            navigate('/create-ward');
          } else {
            navigate('/my-shift');
          }
        } else {
          if (role === 'HN') {
            navigate('/shift-admin');
          } else {
            navigate('/my-shift');
          }
        }
      },
      (error: ApiErrorResponse | AxiosError) => {
        useLoadingStore.getState().setLoading(true);
        // 이미 다른 경로로 가입한 경우, 에러 메세지 띄우기
        if (error.status === 'BAD_REQUEST') {
          toast.error(error.message);
        } else {
          toast.error('다시 시도해주세요.');
        }
        navigate('/login');
      }
    );
  }, []);

  // 로딩 상태를 보여주는 컴포넌트 반환
  return (
    <>
      <SEO
        title="카카오 로그인 | Dutymate"
        description="카카오 로그인 중입니다."
      />
      <PageLoadingSpinner />
    </>
  );
}

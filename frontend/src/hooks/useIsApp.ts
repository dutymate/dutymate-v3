// hooks/useIsApp.ts
import { useEffect, useState } from 'react';

export const useIsApp = () => {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. JS <-> iOS 연결 객체 존재 여부로 감지
    const hasWebkitHandler = !!(window as any).webkit?.messageHandlers
      ?.dutymateiOSApp;

    // 2. UA 기반 감지(백업용)
    const ua = navigator.userAgent || '';
    const hasUA = /Dutymate_iOSApp/i.test(ua);

    // 3. URL 플래그 감지(백업용)
    const params = new URLSearchParams(window.location.search);
    const hasQuery = params.get('env') === 'iosapp';

    if (hasWebkitHandler || hasUA || hasQuery) {
      setIsApp(true);
      // iOS에 초기 메시지 보낼 수도 있음
      try {
        (window as any).webkit?.messageHandlers?.dutymateiOSApp?.postMessage(
          'ready'
        );
      } catch (err) {
        console.log('메시지 전송 실패:', err);
      }
    }
  }, []);

  return isApp;
};

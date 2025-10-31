import { useEffect, useRef } from 'react';

interface CoupangAdProps {
  id: number;
  template?: string;
  trackingCode: string;
  width?: number | string;
  height?: number | string;
  tsource?: string;
  className?: string;
}

declare global {
  interface Window {
    PartnersCoupang?: {
      G: new (config: {
        id: number;
        template?: string;
        trackingCode: string;
        width?: number | string;
        height?: number | string;
        tsource?: string;
      }) => void;
    };
  }
}

const CoupangAd = ({
  id,
  template = 'carousel',
  trackingCode,
  width = 400,
  height = 400,
  tsource = '',
  className = '',
}: CoupangAdProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const adInitializedRef = useRef(false);

  useEffect(() => {
    // 스크립트가 이미 로드되어 있는지 확인
    if (scriptLoadedRef.current) {
      return;
    }

    // 스크립트가 이미 문서에 있는지 확인
    const existingScript = document.querySelector(
      'script[src="https://ads-partners.coupang.com/g.js"]'
    );

    if (!existingScript) {
      // 스크립트 동적 로드
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://ads-partners.coupang.com/g.js';
      script.async = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        // 스크립트 로드 후 광고 초기화
        initializeAd();
      };
      document.body.appendChild(script);
    } else {
      scriptLoadedRef.current = true;
      // 스크립트가 이미 있으면 바로 초기화
      initializeAd();
    }

    // 광고 초기화 함수
    function initializeAd() {
      if (adInitializedRef.current || !containerRef.current) {
        return;
      }

      // 스크립트가 완전히 로드될 때까지 대기
      const checkAndInit = () => {
        if (window.PartnersCoupang && window.PartnersCoupang.G) {
          try {
            new window.PartnersCoupang.G({
              id,
              template,
              trackingCode,
              width,
              height,
              tsource,
            });
            adInitializedRef.current = true;
          } catch (error) {
            console.error('쿠팡 광고 초기화 실패:', error);
          }
        } else {
          // 아직 로드되지 않았으면 잠시 후 다시 시도
          setTimeout(checkAndInit, 100);
        }
      };

      checkAndInit();
    }
  }, [id, template, trackingCode, width, height, tsource]);

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center w-full ${className}`}
    />
  );
};

export default CoupangAd;

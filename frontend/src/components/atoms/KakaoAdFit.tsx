import { useEffect, useRef } from 'react';

interface KakaoAdFitProps {
  adUnit: string;
  width?: number;
  height?: number;
  className?: string;
}

const KakaoAdFit = ({ adUnit, width = 728, height = 90, className = '' }: KakaoAdFitProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // 스크립트가 이미 로드되어 있는지 확인
    if (scriptLoadedRef.current) {
      return;
    }

    // 스크립트가 이미 문서에 있는지 확인
    const existingScript = document.querySelector(
      'script[src="//t1.daumcdn.net/kas/static/ba.min.js"]'
    );

    if (!existingScript) {
      // 스크립트 동적 로드
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
      script.async = true;
      document.body.appendChild(script);
      scriptLoadedRef.current = true;
    } else {
      scriptLoadedRef.current = true;
    }

    // 광고 초기화는 스크립트 로드 후 실행되어야 함
    // AdFit SDK는 자동으로 초기화되므로 별도 처리 불필요
  }, []);

  return (
    <div className={`flex justify-center items-center w-full ${className}`}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adUnit}
        data-ad-width={width}
        data-ad-height={height}
        ref={adRef}
      />
    </div>
  );
};

export default KakaoAdFit;

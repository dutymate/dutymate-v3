import KakaoAdFit from '@/components/atoms/KakaoAdFit';

interface KakaoAdSectionProps {
  className?: string;
}

const KakaoAdSection = ({ className }: KakaoAdSectionProps) => {
  return (
    <div className={`mt-auto ${className || ''}`}>
      <KakaoAdFit adUnit="DAN-pT3xgKJeCjM28vGP" width={728} height={90} className="py-4" />
    </div>
  );
};

export default KakaoAdSection;

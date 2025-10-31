import CoupangAd from '@/components/atoms/CoupangAd';

interface CoupangAdSectionProps {
  className?: string;
}

const CoupangAdSection = ({ className }: CoupangAdSectionProps) => {
  return (
    <div className={`mt-auto ${className || ''}`}>
      <CoupangAd
        id={937614}
        template="carousel"
        trackingCode="AF7748427"
        width={400}
        height={400}
        tsource=""
        className="py-4"
      />
    </div>
  );
};

export default CoupangAdSection;

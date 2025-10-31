interface CoupangAdProps {
  id: number;
  template?: string;
  trackingCode: string;
  width?: number;
  height?: number;
  subId?: string;
  tsource?: string;
  className?: string;
}

const CoupangAd = ({
  id,
  template = 'carousel',
  trackingCode,
  width = 200,
  height = 220,
  subId = '',
  tsource = '',
  className = '',
}: CoupangAdProps) => {
  const widgetUrl = `https://ads-partners.coupang.com/widgets.html?id=${id}&template=${template}&trackingCode=${trackingCode}&subId=${subId}&width=${width}&height=${height}&tsource=${tsource}`;

  return (
    <div className={className}>
      <iframe
        src={widgetUrl}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        referrerPolicy="unsafe-url"
        style={{ border: 'none', display: 'block' }}
        title="쿠팡 파트너스"
      />
    </div>
  );
};

export default CoupangAd;

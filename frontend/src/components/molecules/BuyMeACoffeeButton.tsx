import { Button } from '../atoms/Button';

interface BuyMeACoffeeButtonProps {
  className?: string;
}

const BuyMeACoffeeButton = ({ className }: BuyMeACoffeeButtonProps) => {
  return (
    <a
      href="https://www.buymeacoffee.com/dutymate"
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full max-w-[23.2rem] mt-1 ${className || ''}`}
    >
      <Button
        size="lg"
        width="long"
        className="h-[3.5rem] sm:h-[3rem] bg-primary-dark hover:bg-primary text-white w-full shadow-md"
      >
        <span className="text-[1rem]">☕ 듀티메이트팀에게 커피 후원하기</span>
      </Button>
    </a>
  );
};

export default BuyMeACoffeeButton;

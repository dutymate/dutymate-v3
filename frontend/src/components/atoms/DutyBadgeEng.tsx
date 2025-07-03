import useUserAuthStore from '@/stores/userAuthStore';
import { convertDutyTypeSafe, getDutyColors } from '@/utils/dutyUtils';

interface DutyBadgeEngProps {
  type: 'D' | 'E' | 'N' | 'O' | 'ALL' | 'X' | 'M';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  onClick?: () => void;
  variant?: 'filled' | 'outline' | 'letter';
  noRing?: boolean;
  customLabel?: string;
  useSmallText?: boolean;
  useCustomColors?: boolean;
  bgColor?: string;
  textColor?: string;
}

const DutyBadgeEng = ({
  type,
  size = 'md',
  variant = 'filled',
  isSelected = false,
  onClick,
  customLabel,
  useSmallText = false,
  useCustomColors = false,
  bgColor,
  textColor,
}: DutyBadgeEngProps) => {
  const { userInfo } = useUserAuthStore();
  const dutyColors = useCustomColors ? getDutyColors(userInfo?.color) : null;

  const sizeClasses = {
    xs: 'w-5 h-5 text-sm',
    sm: 'w-6 h-6 text-base',
    md: 'w-8 h-8 text-lg',
    lg: 'w-10 h-10 text-xl',
  };

  const getRingColor = (type: DutyBadgeEngProps['type']) => {
    switch (type) {
      case 'D':
        return 'ring-duty-day';
      case 'E':
        return 'ring-duty-evening';
      case 'N':
        return 'ring-duty-night';
      case 'O':
        return 'ring-duty-off';
      case 'X':
        return 'ring-base-foreground';
      case 'M':
        return 'ring-duty-mid';
      default:
        return 'ring-base-foreground';
    }
  };

  const badgeStyles = {
    filled: {
      D: `bg-duty-day text-white ${
        isSelected ? `ring-2 ring-offset-2 ${getRingColor('D')}` : ''
      }`,
      E: `bg-duty-evening text-white ${
        isSelected ? `ring-2 ring-offset-2 ${getRingColor('E')}` : ''
      }`,
      N: `bg-duty-night text-white ${
        isSelected ? `ring-2 ring-offset-2 ${getRingColor('N')}` : ''
      }`,
      O: `bg-duty-off text-white ${
        isSelected ? `ring-2 ring-offset-2 ${getRingColor('O')}` : ''
      }`,
      ALL: `bg-base-foreground text-white ${
        isSelected ? `ring-2 ring-offset-2 ${getRingColor('ALL')}` : ''
      }`,
      X: `bg-base-muted text-white font-bold ${
        isSelected ? `ring-2 ring-offset-2 ${getRingColor('X')}` : ''
      }`,
      M: `bg-duty-mid text-white ${
        isSelected ? `ring-2 ring-offset-2 ${getRingColor('M')}` : ''
      }`,
    },
    outline: {
      D: 'bg-white text-duty-day border-2 border-duty-day hover:ring-2 hover:ring-offset-2 hover:ring-duty-day focus:ring-2 focus:ring-offset-2 focus:ring-duty-day',
      E: 'bg-white text-duty-evening border-2 border-duty-evening hover:ring-2 hover:ring-offset-2 hover:ring-duty-evening focus:ring-2 focus:ring-offset-2 focus:ring-duty-evening',
      N: 'bg-white text-duty-night border-2 border-duty-night hover:ring-2 hover:ring-offset-2 hover:ring-duty-night focus:ring-2 focus:ring-offset-2 focus:ring-duty-night',
      O: 'bg-white text-duty-off border-2 border-duty-off hover:ring-2 hover:ring-offset-2 hover:ring-duty-off focus:ring-2 focus:ring-offset-2 focus:ring-duty-off',
      ALL: 'bg-white text-base-foreground border-2 border-base-foreground hover:ring-2 hover:ring-offset-2 hover:ring-base-foreground focus:ring-2 focus:ring-offset-2 focus:ring-base-foreground',
      X: 'bg-white text-base-muted border-2 border-base-muted font-bold hover:ring-2 hover:ring-offset-2 hover:ring-base-muted focus:ring-2 focus:ring-offset-2 focus:ring-base-muted',
      M: 'bg-white text-duty-mid border-2 border-duty-mid hover:ring-2 hover:ring-offset-2 hover:ring-duty-mid focus:ring-2 focus:ring-offset-2 focus:ring-duty-mid',
    },
    letter: {
      D: 'text-duty-day',
      E: 'text-duty-evening',
      N: 'text-duty-night',
      O: 'text-duty-off',
      ALL: 'text-base-foreground',
      X: 'text-base-muted font-bold',
      M: 'text-duty-mid',
    },
  };

  const getDisplayText = () => {
    if (customLabel) return customLabel;
    if (type === 'X') return '-';
    if (type === 'ALL') return 'All';
    return type;
  };

  const getCustomStyle = () => {
    if (!useCustomColors || !dutyColors) return {};

    if (bgColor || textColor) {
      if (variant === 'letter') {
        return { color: textColor };
      } else if (variant === 'outline') {
        return {
          color: textColor,
          backgroundColor: '#FFFFFF',
          border: `2px solid ${textColor}`,
        };
      } else {
        return {
          backgroundColor: bgColor,
          color: textColor,
          ...(isSelected && {
            boxShadow: `0 0 0 2px white, 0 0 0 4px ${bgColor}`,
          }),
        };
      }
    }

    if (type === 'ALL' || type === 'X') {
      return {};
    }

    const dutyType = convertDutyTypeSafe(type);
    const color = dutyColors[dutyType];

    if (variant === 'letter') {
      return { color: color.text };
    } else if (variant === 'outline') {
      return {
        color: color.text,
        backgroundColor: color.bg,
      };
    } else {
      return {
        backgroundColor: color.bg,
        color: color.text,
        ...(isSelected && {
          boxShadow: `0 0 0 2px white, 0 0 0 4px ${color.bg}`,
        }),
      };
    }
  };

  const customStyle = useCustomColors ? getCustomStyle() : {};

  return (
    <div
      onClick={onClick}
      translate="no"
      className={`
        ${sizeClasses[size]}
        ${!useCustomColors ? badgeStyles[variant][type] : ''}
        flex items-center justify-center
        rounded-[9px] font-medium
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-200
        ${useSmallText ? 'text-[0.875rem]' : 'text-md'}
      `}
      style={customStyle}
    >
      {getDisplayText()}
    </div>
  );
};

export default DutyBadgeEng;

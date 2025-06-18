import { Badge, BadgeSize } from './Badge';
import { getVerticalColorClass } from '@/lib/utils';

interface VerticalBadgeProps {
  vertical: string;
  size?: BadgeSize;
  className?: string;
}

interface CampaignTypeBadgeProps {
  type: string;
  size?: BadgeSize;
  className?: string;
}

interface StatusBadgeProps {
  status: 'active' | 'completed' | 'planned';
  size?: BadgeSize;
  className?: string;
}

// Бейдж вертикали с правильными цветами
export function VerticalBadge({
  vertical,
  size = 'md',
  className,
}: VerticalBadgeProps) {
  const verticalStyle = getVerticalColorClass(vertical);

  return (
    <Badge
      size={size}
      className={`${
        vertical === 'Авито' ? 'text-black' : 'text-white'
      } ${className || ''}`}
      style={verticalStyle}
    >
      {vertical}
    </Badge>
  );
}

// Бейдж типа кампании
export function CampaignTypeBadge({
  type,
  size = 'md',
  className,
}: CampaignTypeBadgeProps) {
  return (
    <Badge
      variant="secondary"
      size={size}
      className={`border border-white bg-transparent text-white hover:bg-white hover:text-gray-900 transition-colors ${className || ''}`}
    >
      {type}
    </Badge>
  );
}

// Бейдж статуса кампании
export function StatusBadge({
  status,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { variant: 'success' as const, text: 'Активная' };
      case 'completed':
        return { variant: 'default' as const, text: 'Завершена' };
      case 'planned':
        return { variant: 'info' as const, text: 'Запланирована' };
      default:
        return { variant: 'default' as const, text: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.text}
    </Badge>
  );
}

// Бейдж для целей/каналов/задач
export function GenericBadge({
  children,
  color = 'blue',
  size = 'md',
  className,
}: {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  size?: BadgeSize;
  className?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    purple: 'bg-purple-600 text-white',
    yellow: 'bg-yellow-600 text-white',
    red: 'bg-red-600 text-white',
  };

  return (
    <Badge size={size} className={`${colorClasses[color]} ${className || ''}`}>
      {children}
    </Badge>
  );
}

// Группа бейджей для кампании
export function CampaignBadgeGroup({
  vertical,
  type,
  size = 'md',
  className,
  showType = true,
}: {
  vertical: string;
  type: string;
  size?: BadgeSize;
  className?: string;
  showType?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <VerticalBadge vertical={vertical} size={size} />
      {showType && <CampaignTypeBadge type={type} size={size} />}
    </div>
  );
}

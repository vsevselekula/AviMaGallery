import React from 'react';

interface CampaignTagProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function CampaignTag({
  children,
  color = 'gray',
  className = '',
}: CampaignTagProps) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${color}-700 text-white mr-2 mb-1 ${className}`}
    >
      {children}
    </span>
  );
}

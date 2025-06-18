import React from 'react';

interface CampaignSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CampaignSection({
  title,
  icon,
  children,
  className = '',
}: CampaignSectionProps) {
  return (
    <section
      className={`bg-gray-800 rounded-xl p-6 flex flex-col gap-2 shadow ${className}`}
    >
      <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

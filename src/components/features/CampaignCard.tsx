import Image from 'next/image';
import { Campaign } from '@/lib/types';
import { cn, getVerticalColorClass } from '@/lib/utils';

interface CampaignCardProps {
  campaign: Campaign;
  className?: string;
}

export function CampaignCard({ campaign, className }: CampaignCardProps) {
  const isActive = new Date(campaign.flight_period.end_date) > new Date();
  const hasImage = campaign.image_url && campaign.image_url.startsWith('http');

  return (
    <div
      className={cn(
        'relative group cursor-pointer transition-all duration-300 hover:scale-105',
        className
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
        {hasImage && campaign.image_url ? (
          <div className="relative w-full h-full">
            <Image
              src={campaign.image_url}
              alt={campaign.campaign_name}
              style={{ objectFit: 'cover' }}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-gray-500 text-sm">Нет изображения</span>
            </div>
          </div>
        )}
        {isActive && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
            ON AIR
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold text-white">
          {campaign.campaign_name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={getVerticalColorClass(campaign.campaign_vertical)}
          >
            {campaign.campaign_vertical}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium border border-white text-white bg-transparent">
            {campaign.campaign_type}
          </span>
        </div>
        <p className="text-sm text-gray-300 mt-2 line-clamp-2">
          {campaign.key_message}
        </p>
        <div className="mt-2">
          <span className="text-xs text-gray-400">
            {new Date(campaign.flight_period.start_date).toLocaleDateString(
              'ru-RU'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

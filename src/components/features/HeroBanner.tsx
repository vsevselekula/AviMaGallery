'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Campaign } from '@/lib/types';
import { cn, getVerticalColorClass } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { CampaignModal } from './CampaignModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface HeroBannerProps {
  campaigns: Campaign[];
  className?: string;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function HeroBanner({ campaigns, className, onCampaignUpdated }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id)
          .single();
        if (roleData) {
          setIsAdmin(roleData.role === 'admin' || roleData.role === 'super_admin');
        }
      }
    };

    fetchUserRole();
  }, []);

  const activeCampaigns = campaigns.filter(campaign => {
    const endDate = new Date(campaign.flight_period.end_date);
    return endDate > new Date();
  });

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeCampaigns.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activeCampaigns.length]);

  const handleCampaignClick = (campaign: Campaign) => {
    if (!isAutoPlaying) return;
    setCurrentCampaign(campaign);
    setIsModalOpen(true);
    setIsAutoPlaying(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCampaign(null);
    setIsAutoPlaying(true);
  };

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    if (onCampaignUpdated) {
      onCampaignUpdated(updatedCampaign);
    }
    setCurrentCampaign(updatedCampaign);
  };

  if (activeCampaigns.length === 0) {
    return null;
  }

  return (
    <div className={cn('relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={activeCampaigns[currentIndex].image_url || '/placeholder-banner.jpg'}
            alt={activeCampaigns[currentIndex].campaign_name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent p-6 md:p-8 flex flex-col justify-end">
            <div className="flex items-center mb-2">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={getVerticalColorClass(activeCampaigns[currentIndex].campaign_vertical)}
              >
                {activeCampaigns[currentIndex].campaign_vertical}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-2">
              {activeCampaigns[currentIndex].campaign_name}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-4">
              {activeCampaigns[currentIndex].key_message}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                {format(new Date(activeCampaigns[currentIndex].flight_period.start_date), 'd MMMM', { locale: ru })} - {format(new Date(activeCampaigns[currentIndex].flight_period.end_date), 'd MMMM', { locale: ru })}
              </span>
              <button
                onClick={() => handleCampaignClick(activeCampaigns[currentIndex])}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Подробнее
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {activeCampaigns.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAutoPlaying) return;
              setCurrentIndex(index);
              setIsAutoPlaying(false);
            }}
            className={cn(
              'w-3 h-3 rounded-full transition-colors',
              index === currentIndex ? 'bg-white' : 'bg-white/50',
              !isAutoPlaying && 'opacity-50 cursor-not-allowed'
            )}
            disabled={!isAutoPlaying}
          />
        ))}
      </div>

      {isModalOpen && currentCampaign && (
        <CampaignModal
          campaign={currentCampaign}
          onClose={handleCloseModal}
          isAdmin={isAdmin}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}
    </div>
  );
} 
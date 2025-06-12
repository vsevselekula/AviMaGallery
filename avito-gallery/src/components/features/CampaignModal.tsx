'use client';

import { Campaign } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getVerticalColorClass } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

interface CampaignModalProps {
  campaign: Campaign;
  onClose: () => void;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function CampaignModal({ campaign, onClose, onCampaignUpdated }: CampaignModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState(campaign);
  const [userRole, setUserRole] = useState<'viewer' | 'editor' | 'super_admin'>('viewer');
  const modalRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
        }
      }
    };

    checkUserRole();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    if (onCampaignUpdated) {
      onCampaignUpdated(editedCampaign);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm h-screen w-screen !mt-0">
      <div ref={modalRef} className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[51]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {userRole === 'super_admin' && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-12 text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 rounded-lg z-10"
          >
            {isEditing ? 'Отменить' : 'Редактировать'}
          </button>
        )}

        {editedCampaign.image_url && (
          <div className="relative w-full h-48">
            <Image
              src={editedCampaign.image_url}
              alt="Campaign preview"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Название кампании
                </label>
                <input
                  type="text"
                  value={editedCampaign.campaign_name}
                  onChange={(e) => setEditedCampaign({ ...editedCampaign, campaign_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ключевое сообщение
                </label>
                <textarea
                  value={editedCampaign.key_message}
                  onChange={(e) => setEditedCampaign({ ...editedCampaign, key_message: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-white mb-2">
                {editedCampaign.campaign_name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                <span className="px-3 py-1 rounded-full text-sm font-medium"
                  style={getVerticalColorClass(editedCampaign.campaign_vertical)}
                >
                  {editedCampaign.campaign_vertical}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium border border-gray-500 text-gray-300">
                  {editedCampaign.campaign_type}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                  {format(new Date(editedCampaign.flight_period.start_date), 'dd.MM.yyyy', { locale: ru })} - {format(new Date(editedCampaign.flight_period.end_date), 'dd.MM.yyyy', { locale: ru })}
                </span>
              </div>

              {editedCampaign.key_message && (
                <div>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">Ключевое сообщение</h3>
                  <p className="text-gray-200 text-lg">{editedCampaign.key_message}</p>
                </div>
              )}

              {editedCampaign.links && editedCampaign.links.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-300 mb-2">Ссылки</h3>
                  <div className="space-y-2">
                    {editedCampaign.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {editedCampaign.attachments && editedCampaign.attachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-300 mb-2">Вложения</h3>
                  <div className="space-y-2">
                    {editedCampaign.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {attachment.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
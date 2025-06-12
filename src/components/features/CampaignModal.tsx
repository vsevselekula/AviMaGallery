'use client';

import { Campaign, Vertical } from '@/lib/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getVerticalColorClass } from '@/lib/utils';
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import verticalsData from '@/data/verticals.json';
import { ImageUpload } from './ImageUpload';
import { VideoPlayer } from './VideoPlayer';
import Image from 'next/image';

interface UserProfile {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'super_admin';
}

interface CampaignModalProps {
  campaign: Campaign;
  onClose: () => void;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function CampaignModal({ campaign, onClose, onCampaignUpdated }: CampaignModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState<Campaign>(campaign);
  const [userRole, setUserRole] = useState<UserProfile['role'] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [linksText, setLinksText] = useState('');
  const [attachmentsText, setAttachmentsText] = useState('');

  useEffect(() => {
    console.log('CampaignModal: Campaign prop received/changed:', campaign);
    setEditedCampaign(campaign);
    if (Array.isArray(campaign.links)) {
      setLinksText(campaign.links.map(link => `${link.label} - ${link.url}`).join('\n'));
    } else {
      setLinksText('');
    }
    if (Array.isArray(campaign.attachments)) {
      setAttachmentsText(campaign.attachments.map(attachment => `${attachment.label} - ${attachment.url}`).join('\n'));
    } else {
      setAttachmentsText('');
    }
  }, [campaign]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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
          setUserRole(roleData.role);
        }
      }
    };
    fetchUserRole();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedCampaign(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (type: 'start_date' | 'end_date', value: string) => {
    setEditedCampaign(prev => ({
      ...prev,
      flight_period: {
        ...prev.flight_period,
        [type]: value,
      },
    }));
  };

  const handleArrayChange = (name: keyof Campaign, value: string) => {
    const newArray = value.split('\n').map(item => item.trim()).filter(item => item !== '');
    setEditedCampaign(prev => ({ 
      ...prev, 
      [name]: newArray.length === 0 ? [] : newArray // Если массив пустой, устанавливаем пустой массив
    }));
  };

  const handleTextareaChange = (type: 'links' | 'attachments', value: string) => {
    if (type === 'links') {
      setLinksText(value);
    } else {
      setAttachmentsText(value);
    }
  };

  const handleSave = async () => {
    console.log('CampaignModal: Attempting to save, current editedCampaign:', editedCampaign);
    try {
      setIsSaving(true);

      const parsedLinks = linksText.split('\n').map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') return null;
        const [label, url] = trimmedLine.split(' - ').map(item => item.trim());
        return { label: label || '', url: url || '' };
      }).filter(item => item !== null && item.label && item.url);

      const parsedAttachments = attachmentsText.split('\n').map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') return null;
        const [label, url] = trimmedLine.split(' - ').map(item => item.trim());
        return { label: label || '', url: url || '' };
      }).filter(item => item !== null && item.label && item.url);

      const { data, error } = await supabase
        .from('campaigns')
        .update({
          campaign_name: editedCampaign.campaign_name,
          flight_period: editedCampaign.flight_period,
          campaign_vertical: editedCampaign.campaign_vertical,
          campaign_type: editedCampaign.campaign_type,
          status: editedCampaign.status,
          image_url: editedCampaign.image_url,
          video_url: editedCampaign.video_url,
          video_type: editedCampaign.video_type,
          links: parsedLinks,
          attachments: parsedAttachments,
          objectives: editedCampaign.objectives || [],
          channels: editedCampaign.channels || [],
          geo: editedCampaign.geo,
          audience: editedCampaign.audience,
          key_message: editedCampaign.key_message,
        })
        .eq('id', campaign.id)
        .select()
        .single();

      if (error) throw error;
      
      setEditedCampaign(data);
      setLinksText(data.links ? data.links.map((link: { label: string; url: string; }) => `${link.label} - ${link.url}`).join('\n') : '');
      setAttachmentsText(data.attachments ? data.attachments.map((attachment: { label: string; url: string; }) => `${attachment.label} - ${attachment.url}`).join('\n') : '');

      console.log('CampaignModal: Local editedCampaign updated to:', data);
      
      if (onCampaignUpdated) {
        console.log('CampaignModal: Calling onCampaignUpdated with:', data);
        onCampaignUpdated(data);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('CampaignModal: Error saving campaign:', error);
      alert(`Ошибка при сохранении кампании: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setEditedCampaign(prev => ({
      ...prev,
      image_url: imageUrl,
    }));
  };

  const handleVideoTypeChange = useCallback((type: 'google_drive' | 'yandex_disk' | undefined) => {
    setEditedCampaign(prev => ({
      ...prev,
      video_type: type,
    }));
  }, []);

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

        <div className="p-6 bg-gray-800 text-white">
          <div className="space-y-6">
            {isEditing ? (
              <>
                <div className="flex items-center gap-4">
                  <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="campaign_type">
                    Тип кампании:
                  </label>
                  <select
                    name="campaign_type"
                    id="campaign_type"
                    value={editedCampaign.campaign_type}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white p-2 rounded-lg"
                  >
                    <option value="T1">T1</option>
                    <option value="Т2">Т2</option>
                    <option value="T3">T3</option>
                    <option value="Special">Special</option>
                  </select>

                  <label className="block text-gray-400 text-sm font-bold mb-2 ml-4" htmlFor="campaign_vertical">
                    Вертикаль:
                  </label>
                  <select
                    name="campaign_vertical"
                    id="campaign_vertical"
                    value={editedCampaign.campaign_vertical}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white p-2 rounded-lg"
                  >
                    {(verticalsData as Vertical[]).map(vertical => (
                      <option key={vertical.id} value={vertical.name}>
                        {vertical.name}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="campaign_name">
                  Название кампании:
                </label>
                <input
                  type="text"
                  name="campaign_name"
                  id="campaign_name"
                  value={editedCampaign.campaign_name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                />

                <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="key_message">
                  Ключевое сообщение:
                </label>
                <textarea
                  name="key_message"
                  id="key_message"
                  value={editedCampaign.key_message}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                  rows={3}
                ></textarea>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Период</h3>
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="start_date">
                      Дата начала:
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      id="start_date"
                      value={format(new Date(editedCampaign.flight_period.start_date), 'yyyy-MM-dd')}
                      onChange={(e) => handleDateChange('start_date', e.target.value)}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                    />
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="end_date">
                      Дата окончания:
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      id="end_date"
                      value={format(new Date(editedCampaign.flight_period.end_date), 'yyyy-MM-dd')}
                      onChange={(e) => handleDateChange('end_date', e.target.value)}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">География</h3>
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="geo">
                      География:
                    </label>
                    <input
                      type="text"
                      name="geo"
                      id="geo"
                      value={editedCampaign.geo}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Целевая аудитория</h3>
                    <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="audience">
                      Целевая аудитория:
                    </label>
                    <input
                      type="text"
                      name="audience"
                      id="audience"
                      value={editedCampaign.audience}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Цели (каждая с новой строки)</h3>
                    <textarea
                      name="objectives"
                      id="objectives"
                      value={editedCampaign.objectives.join('\n')}
                      onChange={(e) => handleArrayChange('objectives', e.target.value)}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                      rows={4}
                    ></textarea>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Каналы (каждый с новой строки)</h3>
                  <textarea
                    name="channels"
                    id="channels"
                    value={editedCampaign.channels.join('\n')}
                    onChange={(e) => handleArrayChange('channels', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                    rows={4}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="links">
                    Ссылки (каждая на новой строке, формат: Метка - URL):
                  </label>
                  <textarea
                    name="links"
                    id="links"
                    value={linksText}
                    onChange={(e) => handleTextareaChange('links', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                    rows={5}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="attachments">
                    Вложения (каждое на новой строке, формат: Метка - URL):
                  </label>
                  <textarea
                    name="attachments"
                    id="attachments"
                    value={attachmentsText}
                    onChange={(e) => handleTextareaChange('attachments', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg mb-4"
                    rows={5}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Обложка кампании
                  </label>
                  <ImageUpload
                    currentImage={editedCampaign.image_url}
                    onImageUpload={handleImageUpload}
                    campaignId={campaign.id}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    disabled={isSaving}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </>
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

                {editedCampaign.objectives && editedCampaign.objectives.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Цели</h3>
                    <ul className="list-disc list-inside text-gray-200 text-lg">
                      {editedCampaign.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {editedCampaign.channels && editedCampaign.channels.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Каналы</h3>
                    <ul className="list-disc list-inside text-gray-200 text-lg">
                      {editedCampaign.channels.map((channel, i) => (
                        <li key={i}>{channel}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {editedCampaign.geo && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Гео</h3>
                    <p className="text-gray-200 text-lg">{editedCampaign.geo}</p>
                  </div>
                )}

                {editedCampaign.audience && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Аудитория</h3>
                    <p className="text-gray-200 text-lg">{editedCampaign.audience}</p>
                  </div>
                )}

                {editedCampaign.links && editedCampaign.links.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Ссылки</h3>
                    <ul className="list-disc list-inside text-gray-200 text-lg">
                      {editedCampaign.links.map((link, i) => (
                        <li key={i}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{link.label || link.url}</a></li>
                      ))}
                    </ul>
                  </div>
                )}

                {editedCampaign.attachments && editedCampaign.attachments.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Вложения</h3>
                    <ul className="list-disc list-inside text-gray-200 text-lg">
                      {editedCampaign.attachments.map((attachment, i) => (
                        <li key={i}><a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{attachment.label || attachment.url}</a></li>
                      ))}
                    </ul>
                  </div>
                )}

                {editedCampaign.video_url && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Видео</h3>
                    <VideoPlayer videoUrl={editedCampaign.video_url} currentVideoType={editedCampaign.video_type} onVideoTypeChange={handleVideoTypeChange} />
                  </div>
                )}

                {userRole === 'super_admin' && isEditing && (
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
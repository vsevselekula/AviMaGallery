'use client';

import { Campaign } from '@/lib/types';
import React, { useState } from 'react';
// import { Vertical } from '@/lib/types';
// import verticalsData from '@/data/verticals.json';
// import { ImageUpload } from './ImageUpload';
// import Image from 'next/image';
// import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getVerticalColorClass } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
// import { ImageUpload } from './ImageUpload';
import { VideoPlayer } from './VideoPlayer';
import { Notification } from '@/components/ui/Notification';
import { useNotification } from '@/hooks/useNotification';
// import React from 'react';
// import { cn } from '@/lib/utils';

interface CampaignModalProps {
  campaign: Campaign;
  onClose: () => void;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
}

export function CampaignModal({
  campaign,
  onClose,
  onCampaignUpdated,
}: CampaignModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState<Campaign>({
    ...campaign,
    video_url: campaign.video_url || null,
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [linksText, setLinksText] = useState('');
  const [attachmentsText, setAttachmentsText] = useState('');
  const [materialsText, setMaterialsText] = useState('');
  const [objectivesText, setObjectivesText] = useState('');
  const [channelsText, setChannelsText] = useState('');
  const [targetsText, setTargetsText] = useState('');

  // Добавляем хук для нотификаций
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Helper для тегов
  const Tag = ({
    children,
    color = 'gray',
  }: {
    children: React.ReactNode;
    color?: string;
  }) => (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${color}-700 text-white mr-2 mb-1`}
    >
      {children}
    </span>
  );

  // Helper для секций
  const Section = ({
    title,
    icon,
    children,
    className = '',
  }: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
  }) => (
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

  useEffect(() => {
    console.log('CampaignModal: Campaign prop received/changed:', campaign);
    setEditedCampaign({
      ...campaign,
      video_url: campaign.video_url || null,
    });
    
    // Инициализация текстовых полей для массивов
    if (Array.isArray(campaign.links)) {
      setLinksText(
        campaign.links.map((link) => `${link.label} - ${link.url}`).join('\n')
      );
    } else {
      setLinksText('');
    }
    
    if (Array.isArray(campaign.attachments)) {
      setAttachmentsText(
        campaign.attachments.map((attachment) => `${attachment.label} - ${attachment.url}`).join('\n')
      );
    } else {
      setAttachmentsText('');
    }

    if (Array.isArray(campaign.materials)) {
      setMaterialsText(campaign.materials.join('\n'));
    } else {
      setMaterialsText('');
    }

    if (Array.isArray(campaign.objectives)) {
      setObjectivesText(campaign.objectives.join('\n'));
    } else {
      setObjectivesText('');
    }

    if (Array.isArray(campaign.channels)) {
      setChannelsText(campaign.channels.join('\n'));
    } else {
      setChannelsText('');
    }

    if (Array.isArray(campaign.targets)) {
      setTargetsText(campaign.targets.join('\n'));
    } else {
      setTargetsText('');
    }
  }, [campaign]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
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
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
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

  const handleInputChange = (field: keyof Campaign, value: string | string[] | { label: string; url: string }[] | 'active' | 'completed' | 'planned' | 'google_drive' | 'yandex_disk' | null) => {
    setEditedCampaign(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    setEditedCampaign(prev => ({
      ...prev,
      flight_period: {
        ...prev.flight_period,
        [field]: value
      }
    }));
  };

  const handleArrayTextChange = (field: string, text: string, setter: (text: string) => void) => {
    setter(text);
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (field === 'links' || field === 'attachments') {
      const items = lines.map(line => {
        const parts = line.split(' - ');
        return {
          label: parts[0] || '',
          url: parts[1] || parts[0] || ''
        };
      });
      handleInputChange(field as keyof Campaign, items);
    } else {
      handleInputChange(field as keyof Campaign, lines);
    }
  };

  const handleSave = async () => {
    if (!userRole || (userRole !== 'super_admin' && userRole !== 'editor')) {
      showError('У вас нет прав для редактирования кампаний');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('campaigns_v2')
        .update({
          campaign_name: editedCampaign.campaign_name,
          campaign_type: editedCampaign.campaign_type,
          key_message: editedCampaign.key_message,
          campaign_vertical: editedCampaign.campaign_vertical,
          flight_period: editedCampaign.flight_period,
          geo: editedCampaign.geo,
          audience: editedCampaign.audience,
          objectives: editedCampaign.objectives,
          channels: editedCampaign.channels,
          materials: editedCampaign.materials,
          links: editedCampaign.links,
          attachments: editedCampaign.attachments,
          status: editedCampaign.status,
          image_url: editedCampaign.image_url,
          video_url: editedCampaign.video_url,
          video_type: editedCampaign.video_type,
          type: editedCampaign.type,
          slogan: editedCampaign.slogan,
          description: editedCampaign.description,
          targets: editedCampaign.targets,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating campaign:', error);
        showError('Ошибка при сохранении кампании');
        return;
      }

      if (data) {
        // Обновляем локальное состояние кампании
        const updatedCampaign = data as Campaign;
        
        // Вызываем callback для обновления родительского компонента
        if (onCampaignUpdated) {
          onCampaignUpdated(updatedCampaign);
        }

        // Обновляем локальное состояние модального окна
        setEditedCampaign(updatedCampaign);
        
        // Обновляем текстовые поля для массивов
        if (Array.isArray(updatedCampaign.links)) {
          setLinksText(
            updatedCampaign.links.map((link) => `${link.label} - ${link.url}`).join('\n')
          );
        }
        
        if (Array.isArray(updatedCampaign.attachments)) {
          setAttachmentsText(
            updatedCampaign.attachments.map((attachment) => `${attachment.label} - ${attachment.url}`).join('\n')
          );
        }

        if (Array.isArray(updatedCampaign.materials)) {
          setMaterialsText(updatedCampaign.materials.join('\n'));
        }

        if (Array.isArray(updatedCampaign.objectives)) {
          setObjectivesText(updatedCampaign.objectives.join('\n'));
        }

        if (Array.isArray(updatedCampaign.channels)) {
          setChannelsText(updatedCampaign.channels.join('\n'));
        }

        if (Array.isArray(updatedCampaign.targets)) {
          setTargetsText(updatedCampaign.targets.join('\n'));
        }

        setIsEditing(false);
        showSuccess('Кампания успешно обновлена!');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      showError('Ошибка при сохранении кампании');
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = userRole === 'super_admin' || userRole === 'editor';

  // Helper для ссылок
  const renderLinks = (
    links:
      | { label?: string; url?: string }[]
      | Record<string, string>
      | string
      | null
      | undefined
  ) => {
    if (!links) return <span className="text-gray-400">Нет данных</span>;
    if (Array.isArray(links)) {
      return (
        <ul className="list-disc ml-6">
          {links.map((l, i) => (
            <li key={i}>
              {typeof l === 'object' &&
              l !== null &&
              'label' in l &&
              'url' in l &&
              l.label &&
              l.url ? (
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {l.label}
                </a>
              ) : typeof l === 'object' && l !== null && 'url' in l && l.url ? (
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {l.url}
                </a>
              ) : typeof l === 'object' &&
                l !== null &&
                'label' in l &&
                l.label ? (
                l.label
              ) : (
                String(l)
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof links === 'object' && links !== null) {
      return (
        <ul className="list-disc ml-6">
          {Object.entries(links).map(([k, v]) => (
            <li key={k}>
              {typeof v === 'string' && v.startsWith('http') ? (
                <a
                  href={v}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {k}
                </a>
              ) : typeof v === 'string' ? (
                `${k}: ${v}`
              ) : (
                `${k}: ${JSON.stringify(v)}`
              )}
            </li>
          ))}
        </ul>
      );
    }
    return <span>{String(links)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm !mt-0">
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full p-8 relative overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
        
        {/* Кнопки управления для админов */}
        {isAdmin && (
          <div className="absolute top-4 left-4 flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ✏️ Редактировать
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isSaving ? '💾 Сохранение...' : '💾 Сохранить'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedCampaign({ ...campaign, video_url: campaign.video_url || null });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  ❌ Отмена
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Основная информация — на всю ширину */}
          <Section
            title="Основное"
            icon={<span>📢</span>}
            className="md:col-span-2"
          >
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название кампании
                  </label>
                  <input
                    type="text"
                    value={editedCampaign.campaign_name}
                    onChange={(e) => handleInputChange('campaign_name', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Тип кампании
                    </label>
                    <input
                      type="text"
                      value={editedCampaign.campaign_type}
                      onChange={(e) => handleInputChange('campaign_type', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Вертикаль
                    </label>
                    <input
                      type="text"
                      value={editedCampaign.campaign_vertical}
                      onChange={(e) => handleInputChange('campaign_vertical', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Дата начала
                    </label>
                    <input
                      type="date"
                      value={editedCampaign.flight_period?.start_date?.split('T')[0] || ''}
                      onChange={(e) => handleDateChange('start_date', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Дата окончания
                    </label>
                    <input
                      type="date"
                      value={editedCampaign.flight_period?.end_date?.split('T')[0] || ''}
                      onChange={(e) => handleDateChange('end_date', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ключевое сообщение
                  </label>
                  <textarea
                    value={editedCampaign.key_message}
                    onChange={(e) => handleInputChange('key_message', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={editedCampaign.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Тип
                    </label>
                    <input
                      type="text"
                      value={editedCampaign.type || ''}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Слоган
                    </label>
                    <input
                      type="text"
                      value={editedCampaign.slogan || ''}
                      onChange={(e) => handleInputChange('slogan', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Статус
                    </label>
                    <select
                      value={editedCampaign.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'completed' | 'planned')}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planned">Запланирована</option>
                      <option value="active">Активна</option>
                      <option value="completed">Завершена</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold mb-2 text-white">
                  {editedCampaign.campaign_name}
                </div>
                <div className="flex gap-2 flex-wrap mb-2">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={getVerticalColorClass(editedCampaign.campaign_vertical)}
                  >
                    {editedCampaign.campaign_vertical}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium border border-white text-white bg-transparent">
                    {editedCampaign.campaign_type}
                  </span>
                  {editedCampaign.type && <Tag color="indigo">{editedCampaign.type}</Tag>}
                  {editedCampaign.slogan && <Tag color="purple">{editedCampaign.slogan}</Tag>}
                </div>
                {editedCampaign.flight_period?.start_date &&
                  editedCampaign.flight_period?.end_date && (
                    <div className="text-sm text-gray-300 mb-2">
                      В эфире с{' '}
                      {format(
                        new Date(editedCampaign.flight_period.start_date),
                        'dd.MM.yyyy',
                        { locale: ru }
                      )}{' '}
                      по{' '}
                      {format(
                        new Date(editedCampaign.flight_period.end_date),
                        'dd.MM.yyyy',
                        { locale: ru }
                      )}
                    </div>
                  )}
                {editedCampaign.description && (
                  <p className="text-gray-200 mb-1">{editedCampaign.description}</p>
                )}
                {editedCampaign.key_message && (
                  <p className="text-gray-400 italic mb-1">
                    {editedCampaign.key_message}
                  </p>
                )}
              </>
            )}
          </Section>

          {/* Новый ряд: периоды, цели, каналы */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
            <Section title="Периоды и аудитория" icon={<span>📅</span>}>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Гео
                    </label>
                    <input
                      type="text"
                      value={editedCampaign.geo}
                      onChange={(e) => handleInputChange('geo', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Аудитория
                    </label>
                    <textarea
                      value={editedCampaign.audience}
                      onChange={(e) => handleInputChange('audience', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-2">
                    <b>Гео:</b>{' '}
                    {editedCampaign.geo || (
                      <span className="text-gray-500">Нет данных</span>
                    )}
                  </div>
                  <div>
                    <b>Аудитория:</b>{' '}
                    {editedCampaign.audience || (
                      <span className="text-gray-500">Нет данных</span>
                    )}
                  </div>
                </>
              )}
            </Section>
            <Section title="Цели и задачи" icon={<span>🎯</span>}>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Цели (каждая с новой строки)
                    </label>
                    <textarea
                      value={targetsText}
                      onChange={(e) => handleArrayTextChange('targets', e.target.value, setTargetsText)}
                      rows={4}
                      placeholder="Цель 1&#10;Цель 2&#10;Цель 3"
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Задачи (каждая с новой строки)
                    </label>
                    <textarea
                      value={objectivesText}
                      onChange={(e) => handleArrayTextChange('objectives', e.target.value, setObjectivesText)}
                      rows={4}
                      placeholder="Задача 1&#10;Задача 2&#10;Задача 3"
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-2 text-base font-normal text-white">
                  {Array.isArray(editedCampaign.targets) &&
                  editedCampaign.targets.length > 0 ? (
                    editedCampaign.targets.length === 1 ? (
                      editedCampaign.targets[0]
                    ) : (
                      editedCampaign.targets.map((t, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {t}
                        </p>
                      ))
                    )
                  ) : (
                    <span className="text-gray-500">Нет данных</span>
                  )}
                </div>
              )}
            </Section>
            <Section title="Каналы и медиа" icon={<span>📡</span>}>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Каналы (каждый с новой строки)
                    </label>
                    <textarea
                      value={channelsText}
                      onChange={(e) => handleArrayTextChange('channels', e.target.value, setChannelsText)}
                      rows={4}
                      placeholder="ТВ&#10;Радио&#10;Интернет&#10;OOH"
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Материалы (каждый с новой строки)
                    </label>
                    <textarea
                      value={materialsText}
                      onChange={(e) => handleArrayTextChange('materials', e.target.value, setMaterialsText)}
                      rows={3}
                      placeholder="Баннер 1&#10;Видео 1&#10;Аудио 1"
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL изображения
                    </label>
                    <input
                      type="url"
                      value={editedCampaign.image_url || ''}
                      onChange={(e) => handleInputChange('image_url', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL видео
                    </label>
                    <input
                      type="url"
                      value={editedCampaign.video_url || ''}
                      onChange={(e) => handleInputChange('video_url', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Тип видео
                    </label>
                    <select
                      value={editedCampaign.video_type || ''}
                      onChange={(e) => handleInputChange('video_type', e.target.value as 'google_drive' | 'yandex_disk')}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Не указан</option>
                      <option value="google_drive">Google Drive</option>
                      <option value="yandex_disk">Яндекс.Диск</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(editedCampaign.channels ?? []).length > 0 ? (
                      (editedCampaign.channels ?? []).map((c, i) => (
                        <Tag key={i} color="blue">
                          {c}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-gray-500">Нет данных</span>
                    )}
                  </div>
                  {editedCampaign.image_url && (
                    <img
                      src={editedCampaign.image_url}
                      alt="Картинка кампании"
                      className="rounded-lg max-h-40 object-contain mx-auto mb-2"
                    />
                  )}
                  {editedCampaign.video_url && (
                    <VideoPlayer videoUrl={editedCampaign.video_url} />
                  )}
                </>
              )}
            </Section>
          </div>

          {/* Ссылки и тесты в один ряд */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
            <Section
              title="Ссылки"
              icon={<span>🔗</span>}
              className="md:col-span-1"
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ссылки (формат: Название - URL)
                    </label>
                    <textarea
                      value={linksText}
                      onChange={(e) => handleArrayTextChange('links', e.target.value, setLinksText)}
                      rows={4}
                      placeholder="Сайт - https://example.com&#10;Лендинг - https://landing.com"
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Вложения (формат: Название - URL)
                    </label>
                    <textarea
                      value={attachmentsText}
                      onChange={(e) => handleArrayTextChange('attachments', e.target.value, setAttachmentsText)}
                      rows={4}
                      placeholder="Презентация - https://docs.google.com/...&#10;Отчет - https://drive.google.com/..."
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                renderLinks(editedCampaign.links)
              )}
            </Section>
            <Section
              title="Тесты"
              icon={<span>🧪</span>}
              className="md:col-span-2"
            >
              {Array.isArray(editedCampaign.pre_tests) &&
              editedCampaign.pre_tests.length > 0 ? (
                <ul className="list-disc ml-6">
                  {editedCampaign.pre_tests.map((item: unknown, i: number) => {
                    if (
                      item &&
                      typeof item === 'object' &&
                      'label' in item &&
                      'url' in item
                    ) {
                      const testItem = item as { label: string; url: string };
                      return (
                        <li key={i}>
                          <a
                            href={testItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            {testItem.label}
                          </a>
                        </li>
                      );
                    } else if (typeof item === 'string') {
                      return <li key={i}>{item}</li>;
                    }
                    return null;
                  })}
                </ul>
                              ) : editedCampaign.pre_tests &&
                typeof editedCampaign.pre_tests === 'object' &&
                !Array.isArray(editedCampaign.pre_tests) ? (
                <ul className="list-disc ml-6">
                  {Object.entries(editedCampaign.pre_tests).map(
                    ([label, value]: [string, unknown], i) => (
                      <li key={i}>
                        {typeof value === 'string' &&
                        value.startsWith('http') ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            {label}
                          </a>
                        ) : (
                          <span>
                            {label}: {String(value)}
                          </span>
                        )}
                      </li>
                    )
                  )}
                </ul>
              ) : typeof editedCampaign.pre_tests === 'string' ? (
                <div>{editedCampaign.pre_tests}</div>
              ) : !editedCampaign.pre_tests ? (
                <span className="text-gray-500">Нет данных</span>
              ) : null}
            </Section>
          </div>
        </div>

        {/* Компонент нотификаций */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      </div>
    </div>
  );
}

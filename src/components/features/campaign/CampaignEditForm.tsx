import React, { useState, useEffect } from 'react';
import { Campaign } from '@/lib/types';
import { CampaignSection } from './CampaignSection';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface CampaignType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

interface CampaignEditFormProps {
  editedCampaign: Campaign;
  availableVerticals: string[];
  onInputChange: (field: keyof Campaign, value: unknown) => void;
}

export function CampaignEditForm({
  editedCampaign,
  availableVerticals,
  onInputChange,
}: CampaignEditFormProps) {
  const [campaignTypes, setCampaignTypes] = useState<CampaignType[]>([]);
  const supabase = createClientComponentClient();

  // Загружаем типы кампаний из базы данных
  useEffect(() => {
    const fetchCampaignTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('campaign_types')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) {
          console.error('Error fetching campaign types:', error);
          // Fallback к статичным значениям
          setCampaignTypes([
            { id: '1', name: 'T1', is_active: true, sort_order: 1 },
            { id: '2', name: 'T2', is_active: true, sort_order: 2 },
          ]);
        } else {
          setCampaignTypes(data || []);
        }
      } catch (error) {
        console.error('Error fetching campaign types:', error);
        // Fallback к статичным значениям
        setCampaignTypes([
          { id: '1', name: 'T1', is_active: true, sort_order: 1 },
          { id: '2', name: 'T2', is_active: true, sort_order: 2 },
        ]);
      }
    };

    fetchCampaignTypes();
  }, [supabase]);

  const handleArrayChange = (field: keyof Campaign, value: string) => {
    // Просто сохраняем строку как есть, без преобразования в массив
    // Преобразование в массив будет происходить при сохранении
    onInputChange(field, value);
  };

  const handleFlightPeriodChange = (
    field: 'start_date' | 'end_date',
    value: string
  ) => {
    const currentPeriod = editedCampaign.flight_period || {
      start_date: '',
      end_date: '',
    };
    onInputChange('flight_period', {
      ...currentPeriod,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Основная информация */}
      <CampaignSection
        title="Основная информация"
        icon={<span>📋</span>}
        className="md:col-span-2"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              value={editedCampaign.description || ''}
              onChange={(e) => onInputChange('description', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Описание кампании"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Тип кампании
              </label>
              <select
                value={editedCampaign.campaign_type || ''}
                onChange={(e) => onInputChange('campaign_type', e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>
                  Выберите тип кампании
                </option>
                {campaignTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                    {type.description && ` - ${type.description}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Вертикаль
              </label>
              <select
                value={editedCampaign.campaign_vertical || ''}
                onChange={(e) =>
                  onInputChange('campaign_vertical', e.target.value)
                }
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>
                  Выберите вертикаль
                </option>
                {availableVerticals.map((vertical) => (
                  <option key={vertical} value={vertical}>
                    {vertical}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Слоган
            </label>
            <input
              type="text"
              value={editedCampaign.slogan || ''}
              onChange={(e) => onInputChange('slogan', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Слоган кампании"
            />
          </div>
        </div>
      </CampaignSection>

      {/* Периоды и аудитория */}
      <CampaignSection title="Периоды и аудитория" icon={<span>📅</span>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Дата начала
            </label>
            <input
              type="date"
              value={editedCampaign.flight_period?.start_date || ''}
              onChange={(e) =>
                handleFlightPeriodChange('start_date', e.target.value)
              }
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Дата окончания
            </label>
            <input
              type="date"
              value={editedCampaign.flight_period?.end_date || ''}
              onChange={(e) =>
                handleFlightPeriodChange('end_date', e.target.value)
              }
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              География
            </label>
            <input
              type="text"
              value={editedCampaign.geo || ''}
              onChange={(e) => onInputChange('geo', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Регион проведения"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Аудитория
            </label>
            <input
              type="text"
              value={editedCampaign.audience || ''}
              onChange={(e) => onInputChange('audience', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Целевая аудитория"
            />
          </div>
        </div>
      </CampaignSection>

      {/* Таргеты и каналы */}
      <CampaignSection title="Таргеты и каналы" icon={<span>🎯</span>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Таргеты (через запятую или точку)
            </label>
            <input
              type="text"
              value={
                Array.isArray(editedCampaign.targets)
                  ? editedCampaign.targets.join(', ')
                  : typeof editedCampaign.targets === 'string' 
                    ? editedCampaign.targets 
                    : ''
              }
              onChange={(e) => handleArrayChange('targets', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Таргет 1, Таргет 2, Таргет 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Каналы (через запятую или точку)
            </label>
            <input
              type="text"
              value={
                Array.isArray(editedCampaign.channels)
                  ? editedCampaign.channels.join(', ')
                  : typeof editedCampaign.channels === 'string' 
                    ? editedCampaign.channels 
                    : ''
              }
              onChange={(e) => handleArrayChange('channels', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="ТВ, Радио, Интернет"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Цели (через запятую или точку)
            </label>
            <input
              type="text"
              value={
                Array.isArray(editedCampaign.objectives)
                  ? editedCampaign.objectives.join(', ')
                  : typeof editedCampaign.objectives === 'string' 
                    ? editedCampaign.objectives 
                    : ''
              }
              onChange={(e) => handleArrayChange('objectives', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Узнаваемость, Продажи, Лояльность"
            />
          </div>
        </div>
      </CampaignSection>

      {/* Медиа */}
      <CampaignSection title="Медиа" icon={<span>🎬</span>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL изображения
            </label>
            <input
              type="url"
              value={editedCampaign.image_url || ''}
              onChange={(e) => onInputChange('image_url', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL видео
            </label>
            <input
              type="url"
              value={editedCampaign.video_url || ''}
              onChange={(e) => onInputChange('video_url', e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/video.mp4"
            />
          </div>
        </div>
      </CampaignSection>
    </div>
  );
}

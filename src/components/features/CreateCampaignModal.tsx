'use client';

import { useState, useRef, useEffect } from 'react';
import { Campaign } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCampaignCreated: (campaign: Campaign) => void;
}

export function CreateCampaignModal({
  onClose,
  onCampaignCreated,
}: CreateCampaignModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { showSuccess, showError, notification, hideNotification } =
    useNotification();

  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_type: '',
    key_message: '',
    campaign_vertical: '',
    flight_period: {
      start_date: '',
      end_date: '',
    },
    geo: '',
    audience: '',
    objectives: [] as string[],
    channels: [] as string[],
    links: [] as { label: string; url: string }[],
    image_url: '',
    video_url: '',
    video_type: null as 'google_drive' | 'yandex_disk' | null,
    type: '',
    slogan: '',
    description: '',
    targets: [] as string[],
  });

  // Текстовые поля для массивов
  const [objectivesText, setObjectivesText] = useState('');
  const [channelsText, setChannelsText] = useState('');
  const [linksText, setLinksText] = useState('');

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
  }, [supabase]);

  // Функция для автоматического определения статуса по датам
  const getStatusFromDates = (
    startDate: string,
    endDate: string
  ): 'active' | 'completed' | 'planned' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'planned'; // Будущая кампания
    } else if (now > end) {
      return 'completed'; // Прошедшая кампания
    } else {
      return 'active'; // Текущая кампания
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (
    field: 'start_date' | 'end_date',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      flight_period: {
        ...prev.flight_period,
        [field]: value,
      },
    }));
  };

  const handleArrayTextChange = (
    field: string,
    text: string,
    setter: (text: string) => void
  ) => {
    setter(text);
    const lines = text.split('\n').filter((line) => line.trim() !== '');

    if (field === 'links') {
      const items = lines.map((line) => {
        const parts = line.split(' - ');
        return {
          label: parts[0] || '',
          url: parts[1] || parts[0] || '',
        };
      });
      setFormData((prev) => ({ ...prev, [field]: items }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: lines }));
    }
  };

  const validateForm = () => {
    if (!formData.campaign_name.trim()) {
      showError('Название кампании обязательно');
      return false;
    }
    if (!formData.campaign_type.trim()) {
      showError('Тип кампании обязателен');
      return false;
    }
    if (!formData.campaign_vertical.trim()) {
      showError('Вертикаль кампании обязательна');
      return false;
    }
    if (!formData.flight_period.start_date) {
      showError('Дата начала обязательна');
      return false;
    }
    if (!formData.flight_period.end_date) {
      showError('Дата окончания обязательна');
      return false;
    }
    if (
      new Date(formData.flight_period.start_date) >=
      new Date(formData.flight_period.end_date)
    ) {
      showError('Дата окончания должна быть позже даты начала');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!userRole || (userRole !== 'super_admin' && userRole !== 'editor')) {
      showError('У вас нет прав для создания кампаний');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      // Автоматически определяем статус по датам
      const status = getStatusFromDates(
        formData.flight_period.start_date,
        formData.flight_period.end_date
      );

      // Подготавливаем данные для вставки (только поля из схемы БД)
      const insertData = {
        campaign_name: formData.campaign_name,
        campaign_type: formData.campaign_type,
        key_message: formData.key_message || null,
        campaign_vertical: formData.campaign_vertical,
        flight_period: formData.flight_period,
        geo: formData.geo || null,
        audience: formData.audience || null,
        objectives: formData.objectives.length > 0 ? formData.objectives : null,
        channels: formData.channels.length > 0 ? formData.channels : null,
        links: formData.links.length > 0 ? formData.links : null,
        status: status, // Автоматически определенный статус
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        type: formData.type || null,
        slogan: formData.slogan || null,
        description: formData.description || null,
        targets: formData.targets.length > 0 ? formData.targets : null,
        pre_tests: null, // Пока оставляем пустым
        post_tests: null, // Пока оставляем пустым
      };

      console.log('Creating campaign with data:', insertData);

      // Сначала попробуем создать с минимальным набором полей
      const minimalData = {
        campaign_name: formData.campaign_name,
        campaign_type: formData.campaign_type,
        campaign_vertical: formData.campaign_vertical,
        flight_period: formData.flight_period,
        status: status,
      };

      console.log('Trying minimal data first:', minimalData);

      const { data, error } = await supabase
        .from('campaigns_v2')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        console.error(
          'Error details:',
          error.message,
          error.details,
          error.hint
        );
        showError(`Ошибка при создании кампании: ${error.message}`);
        return;
      }

      if (data) {
        showSuccess('Кампания успешно создана!');
        onCampaignCreated(data as Campaign);
        onClose();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      showError('Ошибка при создании кампании');
    } finally {
      setIsCreating(false);
    }
  };

  const verticals = [
    'Услуги',
    'Работа',
    'Авто',
    'Недвижимость',
    'Товары',
    'Авито',
  ];
  const campaignTypes = ['T1', 'T2'];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm !mt-0">
        <div
          ref={modalRef}
          className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative overflow-y-auto max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">
            Создать новую кампанию
          </h2>

          <div className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название кампании *
                </label>
                <input
                  type="text"
                  value={formData.campaign_name}
                  onChange={(e) =>
                    handleInputChange('campaign_name', e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите название кампании"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Тип кампании *
                </label>
                <select
                  value={formData.campaign_type}
                  onChange={(e) =>
                    handleInputChange('campaign_type', e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип кампании</option>
                  {campaignTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Вертикаль *
              </label>
              <select
                value={formData.campaign_vertical}
                onChange={(e) =>
                  handleInputChange('campaign_vertical', e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите вертикаль</option>
                {verticals.map((vertical) => (
                  <option key={vertical} value={vertical}>
                    {vertical}
                  </option>
                ))}
              </select>
            </div>

            {/* Даты */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Дата начала *
                </label>
                <input
                  type="date"
                  value={formData.flight_period.start_date}
                  onChange={(e) =>
                    handleDateChange('start_date', e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Дата окончания *
                </label>
                <input
                  type="date"
                  value={formData.flight_period.end_date}
                  onChange={(e) => handleDateChange('end_date', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Показываем предварительный статус */}
            {formData.flight_period.start_date &&
              formData.flight_period.end_date && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Статус кампании:</span>{' '}
                    <span
                      className={`font-medium ${
                        getStatusFromDates(
                          formData.flight_period.start_date,
                          formData.flight_period.end_date
                        ) === 'active'
                          ? 'text-green-400'
                          : getStatusFromDates(
                                formData.flight_period.start_date,
                                formData.flight_period.end_date
                              ) === 'planned'
                            ? 'text-blue-400'
                            : 'text-gray-400'
                      }`}
                    >
                      {getStatusFromDates(
                        formData.flight_period.start_date,
                        formData.flight_period.end_date
                      ) === 'active' && 'Активна'}
                      {getStatusFromDates(
                        formData.flight_period.start_date,
                        formData.flight_period.end_date
                      ) === 'planned' && 'Запланирована'}
                      {getStatusFromDates(
                        formData.flight_period.start_date,
                        formData.flight_period.end_date
                      ) === 'completed' && 'Завершена'}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      (определяется автоматически по датам)
                    </span>
                  </p>
                </div>
              )}

            {/* Описания */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ключевое сообщение
              </label>
              <textarea
                value={formData.key_message}
                onChange={(e) =>
                  handleInputChange('key_message', e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Основное сообщение кампании"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Подробное описание кампании"
              />
            </div>

            {/* Дополнительные поля */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Гео
                </label>
                <input
                  type="text"
                  value={formData.geo}
                  onChange={(e) => handleInputChange('geo', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Географическое таргетирование"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Аудитория
                </label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) =>
                    handleInputChange('audience', e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Целевая аудитория"
                />
              </div>
            </div>

            {/* Изображение и видео */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Изображение кампании
              </label>
              <ImageUpload
                value={formData.image_url}
                onChange={(imageUrl) =>
                  handleInputChange('image_url', imageUrl)
                }
                onError={(error) => showError(error)}
                campaignId="new-campaign"
                maxSizeMB={10}
                placeholder="Загрузите изображение кампании"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL видео (опционально)
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Массивы данных */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Цели (каждая с новой строки)
                </label>
                <textarea
                  value={objectivesText}
                  onChange={(e) =>
                    handleArrayTextChange(
                      'objectives',
                      e.target.value,
                      setObjectivesText
                    )
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Цель 1&#10;Цель 2&#10;Цель 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Каналы (каждый с новой строки)
                </label>
                <textarea
                  value={channelsText}
                  onChange={(e) =>
                    handleArrayTextChange(
                      'channels',
                      e.target.value,
                      setChannelsText
                    )
                  }
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TV&#10;Digital&#10;Radio"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ссылки (формат: Название - URL)
              </label>
              <textarea
                value={linksText}
                onChange={(e) =>
                  handleArrayTextChange('links', e.target.value, setLinksText)
                }
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Сайт - https://example.com&#10;Лендинг - https://landing.com"
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {isCreating ? '🔄 Создание...' : '✅ Создать кампанию'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              ❌ Отмена
            </button>
          </div>
        </div>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </>
  );
}

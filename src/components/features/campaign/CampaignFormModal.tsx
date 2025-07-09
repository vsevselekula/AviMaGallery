'use client';

import { Campaign } from '@/types/campaign';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Notification } from '@/components/ui/Notification';
import { useNotification } from '@/hooks/useNotification';
import { logger } from '@/lib/logger';
import type { Json } from '@/lib/database.types';

// Импортируем компоненты
import { CampaignModalHeader } from './CampaignModalHeader';
import { CampaignModalHero } from './CampaignModalHero';
import { CampaignModalReactions } from './CampaignModalReactions';
import { CampaignDeleteConfirm } from './CampaignDeleteConfirm';
import { CampaignModalContent } from './CampaignModalContent';
import { CampaignEditForm } from './CampaignEditForm';
import {
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useVerticals,
} from '@/hooks/useCampaignsQuery';

interface CampaignFormModalProps {
  campaign?: Campaign; // Если undefined - режим создания
  onClose: () => void;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
  onCampaignCreated?: (newCampaign: Campaign) => void;
  onCampaignDeleted?: (deletedCampaignId: string) => void;
}

// Пустая кампания для создания
const createEmptyCampaign = (): Campaign => ({
  id: '', // Будет сгенерирован базой данных
  campaign_name: '',
  campaign_type: '', // Будет установлено пользователем
  key_message: '',
  flight_period: {
    start_date: '',
    end_date: '',
  },
  status: 'planned',
  campaign_vertical: '', // Будет установлено пользователем
  geo: '',
  audience: '',
  objectives: [],
  channels: [],
  links: [],
  image_url: '',
  video_url: null,
  type: '',
  slogan: '',
  description: '',
  targets: [],
  pre_tests: null,
  post_tests: null,
  created_at: null, // Будет установлено базой данных
  updated_at: null, // Будет установлено базой данных
});

export function CampaignFormModal({
  campaign,
  onClose,
  onCampaignUpdated,
  onCampaignCreated,
  onCampaignDeleted,
}: CampaignFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const isCreateMode = !campaign;

  // Состояние
  const [isEditing, setIsEditing] = useState(isCreateMode); // В режиме создания сразу редактируем
  const [editedCampaign, setEditedCampaign] = useState<Campaign>(
    campaign
      ? { ...campaign, video_url: campaign.video_url || null }
      : createEmptyCampaign()
  );
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = useMemo(() => createClientComponentClient(), []);
  const { notification, showError, hideNotification } = useNotification();

  // TanStack Query хуки
  const createCampaignMutation = useCreateCampaign();
  const updateCampaignMutation = useUpdateCampaign();
  const deleteCampaignMutation = useDeleteCampaign();
  const { data: availableVerticals = [] } = useVerticals();

  // Обработчик клика вне модального окна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Не закрываем модальное окно, если открыто окно подтверждения удаления
      if (showDeleteConfirm) {
        return;
      }

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
  }, [onClose, showDeleteConfirm]);

  // Получение роли пользователя
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: userRole, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (error) {
            logger.warn(
              'AUTH',
              `User role not found: ${error.code}`,
              error.message
            );
            setUserRole('editor');
          } else {
            setUserRole(userRole?.role || 'editor');
          }
        } else {
          setUserRole('viewer');
        }
      } catch (error) {
        logger.error('AUTH', 'Failed to fetch user role', String(error));
        setUserRole('editor');
      }
    };

    fetchUserRole();
  }, [supabase]);

  // Сброс состояния при изменении кампании
  useEffect(() => {
    if (campaign) {
      setEditedCampaign({
        ...campaign,
        video_url: campaign.video_url || null,
        // Убеждаемся что значения дропдаунов не пустые
        campaign_type: campaign.campaign_type || '',
        campaign_vertical: campaign.campaign_vertical || '',
      });
      setIsEditing(false);
    }
  }, [campaign]);

  // Обработчики
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (isCreateMode) {
      onClose(); // В режиме создания отменяем весь процесс
    } else {
      setIsEditing(false);
      setEditedCampaign({
        ...campaign!,
        video_url: campaign!.video_url || null,
      });
    }
  };

  const handleInputChange = (field: keyof Campaign, value: unknown) => {
    setEditedCampaign((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpdate = (imageUrl: string) => {
    handleInputChange('image_url', imageUrl);
  };

  // Валидация формы
  const validateForm = () => {
    if (!editedCampaign.campaign_name?.trim()) {
      showError('Название кампании обязательно');
      return false;
    }
    if (!editedCampaign.campaign_type?.trim()) {
      showError('Тип кампании обязателен');
      return false;
    }
    if (!editedCampaign.campaign_vertical?.trim()) {
      showError('Вертикаль кампании обязательна');
      return false;
    }
    if (!editedCampaign.flight_period?.start_date?.trim()) {
      showError('Дата начала обязательна');
      return false;
    }
    if (!editedCampaign.flight_period?.end_date?.trim()) {
      showError('Дата окончания обязательна');
      return false;
    }
    if (
      new Date(editedCampaign.flight_period.start_date) >=
      new Date(editedCampaign.flight_period.end_date)
    ) {
      showError('Дата начала должна быть раньше даты окончания');
      return false;
    }
    return true;
  };

  const getStatusFromDates = (
    startDate: string,
    endDate: string
  ): 'active' | 'completed' | 'planned' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'planned';
    if (now > end) return 'completed';
    return 'active';
  };

  const handleSave = async () => {
    if (!userRole || (userRole !== 'super_admin' && userRole !== 'editor')) {
      showError('У вас нет прав для создания/редактирования кампаний');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Преобразуем строковые поля в массивы перед сохранением
      const processArrayField = (
        field: string[] | string | null | undefined
      ): string[] => {
        if (Array.isArray(field)) {
          return field;
        }
        if (typeof field === 'string' && field.trim()) {
          return field
            .replace(/\./g, ',') // Заменяем точки на запятые
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        }
        return [];
      };

      // Функция для очистки ссылок от пустых записей
      const cleanLinks = (
        links: { label: string; url: string }[] | null | undefined
      ) => {
        if (!Array.isArray(links)) return [];
        return links.filter((link) => link.label.trim() || link.url.trim());
      };

      // Функция для очистки тестов от пустых ссылок
      const cleanTestData = (testData: unknown): Json | null => {
        if (!testData) return null;

        if (typeof testData === 'object' && !Array.isArray(testData)) {
          const data = testData as {
            text?: string;
            links?: { label: string; url: string }[];
          };
          if (data.links) {
            return {
              ...data,
              links: cleanLinks(data.links),
            } as Json;
          }
        }

        if (Array.isArray(testData)) {
          // Если это массив ссылок
          const isLinksArray = testData.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'label' in item &&
              'url' in item
          );
          if (isLinksArray) {
            return cleanLinks(
              testData as { label: string; url: string }[]
            ) as Json;
          }
        }

        return testData as Json;
      };

      // Автоматическое определение статуса на основе дат
      const finalCampaign = {
        ...editedCampaign,
        targets: processArrayField(editedCampaign.targets),
        channels: processArrayField(editedCampaign.channels),
        objectives: processArrayField(editedCampaign.objectives),
        links: cleanLinks(editedCampaign.links),
        pre_tests: cleanTestData(editedCampaign.pre_tests),
        post_tests: cleanTestData(editedCampaign.post_tests),
      };

      if (
        editedCampaign.flight_period?.start_date &&
        editedCampaign.flight_period?.end_date
      ) {
        finalCampaign.status = getStatusFromDates(
          editedCampaign.flight_period.start_date,
          editedCampaign.flight_period.end_date
        );
      }

      if (isCreateMode) {
        // Создание новой кампании через TanStack Query
        const result = await createCampaignMutation.mutateAsync(finalCampaign);
        onCampaignCreated?.(result);
        onClose();
      } else {
        // Обновление существующей кампании через TanStack Query
        const result = await updateCampaignMutation.mutateAsync({
          id: campaign!.id,
          updates: finalCampaign,
        });
        setEditedCampaign(result);
        setIsEditing(false);
        onCampaignUpdated?.(result);
      }
    } catch (error) {
      // Ошибки уже обрабатываются в хуках мутаций
      logger.error(
        'DB',
        `Failed to ${isCreateMode ? 'create' : 'update'} campaign`,
        String(error)
      );
    }
  };

  const handleDelete = async () => {
    if (isCreateMode) return; // Нельзя удалить несуществующую кампанию

    if (!userRole || userRole !== 'super_admin') {
      showError(
        'У вас нет прав для удаления кампаний. Требуется роль super_admin.'
      );
      setShowDeleteConfirm(false);
      return;
    }

    try {
      await deleteCampaignMutation.mutateAsync(campaign!.id);
      onCampaignDeleted?.(campaign!.id);
      onClose();
    } catch (error) {
      // Ошибки уже обрабатываются в хуке мутации
      logger.error('DB', 'Failed to delete campaign', String(error));
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => setShowDeleteConfirm(false);

  const isSaving =
    createCampaignMutation.isPending || updateCampaignMutation.isPending;
  const isDeleting = deleteCampaignMutation.isPending;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm !mt-0">
        <div
          ref={modalRef}
          className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full p-8 relative overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок с кнопками действий */}
          <CampaignModalHeader
            campaign={editedCampaign}
            userRole={userRole}
            isEditing={isEditing}
            isSaving={isSaving}
            isDeleting={isDeleting}
            onClose={onClose}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={isCreateMode ? undefined : handleDeleteClick} // Скрываем удаление в режиме создания
            isCreateMode={isCreateMode}
          />

          {/* Hero-секция */}
          <CampaignModalHero
            campaign={isCreateMode ? editedCampaign : campaign!}
            editedCampaign={editedCampaign}
            isEditing={isEditing}
            onImageUpdate={handleImageUpdate}
            onInputChange={handleInputChange}
          />

          {/* Блок реакций - только для существующих кампаний */}
          {!isCreateMode && (
            <CampaignModalReactions campaignId={campaign!.id} />
          )}

          {/* Основной контент или форма редактирования */}
          {isEditing ? (
            <CampaignEditForm
              editedCampaign={editedCampaign}
              availableVerticals={availableVerticals}
              onInputChange={handleInputChange}
            />
          ) : (
            !isCreateMode && <CampaignModalContent campaign={editedCampaign} />
          )}

          {/* Компонент нотификаций */}
          <Notification
            message={notification.message}
            type={notification.type}
            isVisible={notification.isVisible}
            onClose={hideNotification}
          />
        </div>
      </div>

      {/* Модальное окно подтверждения удаления - только для существующих кампаний */}
      {!isCreateMode && showDeleteConfirm && (
        <CampaignDeleteConfirm
          campaignName={campaign!.campaign_name}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
}

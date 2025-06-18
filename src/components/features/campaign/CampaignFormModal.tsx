'use client';

import { Campaign } from '@/lib/types';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Notification } from '@/components/ui/Notification';
import { useNotification } from '@/hooks/useNotification';
import { logger } from '@/lib/logger';

// Импортируем компоненты
import { CampaignModalHeader } from './CampaignModalHeader';
import { CampaignModalHero } from './CampaignModalHero';
import { CampaignModalReactions } from './CampaignModalReactions';
import { CampaignDeleteConfirm } from './CampaignDeleteConfirm';
import { CampaignModalContent } from './CampaignModalContent';
import { CampaignEditForm } from './CampaignEditForm';

interface CampaignFormModalProps {
  campaign?: Campaign; // Если undefined - режим создания
  onClose: () => void;
  onCampaignUpdated?: (updatedCampaign: Campaign) => void;
  onCampaignCreated?: (newCampaign: Campaign) => void;
  onCampaignDeleted?: (deletedCampaignId: string) => void;
}

// Пустая кампания для создания
const createEmptyCampaign = (): Campaign => ({
  id: '',
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableVerticals, setAvailableVerticals] = useState<string[]>([]);

  const supabase = useMemo(() => createClientComponentClient(), []);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();





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

  // Получение доступных вертикалей
  useEffect(() => {
    const fetchVerticals = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns_v2')
          .select('campaign_vertical')
          .not('campaign_vertical', 'is', null);

        if (error) throw error;

        const uniqueVerticals = Array.from(
          new Set(data?.map((item) => item.campaign_vertical).filter(Boolean))
        );
        setAvailableVerticals(uniqueVerticals);
      } catch (error) {
        logger.error('DB', 'Failed to fetch verticals', String(error));
      }
    };

    fetchVerticals();
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
      showError('Дата окончания должна быть позже даты начала');
      return false;
    }
    return true;
  };

  // Автоматическое определение статуса
  const getStatusFromDates = (
    startDate: string,
    endDate: string
  ): 'active' | 'completed' | 'planned' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'planned';
    } else if (now > end) {
      return 'completed';
    } else {
      return 'active';
    }
  };

  const handleSave = async () => {
    if (!userRole || (userRole !== 'super_admin' && userRole !== 'editor')) {
      showError('У вас нет прав для создания/редактирования кампаний');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Преобразуем строковые поля в массивы перед сохранением
      const processArrayField = (
        field: string[] | string | undefined
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

      // Автоматическое определение статуса на основе дат
      const finalCampaign = {
        ...editedCampaign,
        targets: processArrayField(editedCampaign.targets),
        channels: processArrayField(editedCampaign.channels),
        objectives: processArrayField(editedCampaign.objectives),
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
        // Создание новой кампании
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, created_at, updated_at, ...insertData } = finalCampaign;

        logger.info(
          'DB',
          'Creating campaign with data:',
          JSON.stringify(insertData, null, 2)
        );

        const { data, error } = await supabase
          .from('campaigns_v2')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          logger.error(
            'DB',
            `Supabase error: ${error.message}`,
            JSON.stringify(
              {
                code: error.code,
                details: error.details,
                hint: error.hint,
              },
              null,
              2
            )
          );
          throw error;
        }

        onCampaignCreated?.(data);
        showSuccess('Кампания успешно создана!');
        logger.info(
          'DB',
          `Campaign created successfully: ${data.campaign_name}`
        );
        onClose();
      } else {
        // Обновление существующей кампании
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { created_at, updated_at, ...updateData } = finalCampaign;

        logger.info(
          'DB',
          `Updating campaign ${campaign!.id} with role: ${userRole}`
        );

        const { data, error } = await supabase
          .from('campaigns_v2')
          .update(updateData)
          .eq('id', campaign!.id)
          .select()
          .single();

        if (error) {
          logger.error(
            'DB',
            `Supabase error: ${error.message}`,
            JSON.stringify(
              {
                code: error.code,
                details: error.details,
                hint: error.hint,
              },
              null,
              2
            )
          );
          throw error;
        }

        setEditedCampaign(data);
        setIsEditing(false);
        onCampaignUpdated?.(data);
        showSuccess('Кампания успешно обновлена!');
        logger.info(
          'DB',
          `Campaign updated successfully: ${data.campaign_name}`
        );
      }
    } catch (error) {
      logger.error(
        'DB',
        `Failed to ${isCreateMode ? 'create' : 'update'} campaign`,
        String(error)
      );
      showError(
        `Ошибка при ${isCreateMode ? 'создании' : 'сохранении'} кампании`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isCreateMode) return; // Нельзя удалить несуществующую кампанию

    if (!userRole || userRole !== 'super_admin') {
      showError('У вас нет прав для удаления кампаний. Требуется роль super_admin.');
      setShowDeleteConfirm(false);
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('campaigns_v2')
        .delete()
        .eq('id', campaign!.id);

      if (error) {
        throw error;
      }
      showSuccess('Кампания успешно удалена!');
      logger.info(
        'DB',
        `Campaign deleted successfully: ${campaign!.campaign_name}`
      );

      // Уведомляем родительский компонент об удалении
      onCampaignDeleted?.(campaign!.id);
      onClose();
    } catch (error) {
      logger.error(
        'DB',
        `Failed to delete campaign ${campaign!.id}`,
        String(error)
      );
      showError('Ошибка при удалении кампании');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  const handleDeleteCancel = () => setShowDeleteConfirm(false);



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

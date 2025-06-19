import React from 'react';
import { generateCampaignAnnouncement } from '@/lib/campaignAnnouncement';
import { Campaign } from '@/lib/types';

interface CampaignModalHeaderProps {
  campaign: Campaign;
  userRole: string | null;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isCreateMode?: boolean;
}

export function CampaignModalHeader({
  campaign,
  userRole,
  isEditing,
  isSaving,
  isDeleting,
  onClose,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  isCreateMode = false,
}: CampaignModalHeaderProps) {
  const canEdit = userRole === 'super_admin' || userRole === 'editor';
  const canDelete = userRole === 'super_admin';

  const handleExportAnnouncement = async () => {
    try {
      const announcement = generateCampaignAnnouncement(campaign);
      await navigator.clipboard.writeText(announcement);
      
      // Показываем временное уведомление
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[100] animate-fade-in';
      notification.textContent = 'Анонс скопирован в буфер обмена!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error('Ошибка копирования в буфер обмена:', error);
      
      // Fallback - показываем текст в новом окне
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        const announcement = generateCampaignAnnouncement(campaign);
        newWindow.document.write(`
          <html>
            <head><title>Анонс кампании</title></head>
            <body style="font-family: monospace; white-space: pre-wrap; padding: 20px;">
              ${announcement.replace(/\n/g, '<br>')}
            </body>
          </html>
        `);
      }
    }
  };

  return (
    <div className="absolute top-4 right-4 flex gap-2 z-10">
      {/* Кнопки действий для админов */}
      {canEdit && (
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              {!isCreateMode && (
                <button
                  onClick={handleExportAnnouncement}
                  className="bg-purple-600/90 hover:bg-purple-500 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-purple-500 text-sm font-medium"
                >
                  📋 Экспорт анонса
                </button>
              )}
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="bg-blue-600/90 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-blue-500 text-sm font-medium"
                >
                  ✏️ Редактировать
                </button>
              )}
              {!isCreateMode && onDelete && canDelete && (
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="bg-red-600/90 hover:bg-red-500 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-red-500 text-sm font-medium disabled:opacity-50"
                >
                  {isDeleting ? '⏳ Удаление...' : '🗑️ Удалить'}
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="bg-green-600/90 hover:bg-green-500 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-green-500 text-sm font-medium disabled:opacity-50"
              >
                {isSaving
                  ? '⏳ Сохранение...'
                  : isCreateMode
                    ? '✅ Создать'
                    : '💾 Сохранить'}
              </button>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="bg-gray-600/90 hover:bg-gray-500 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-gray-500 text-sm font-medium disabled:opacity-50"
              >
                ❌ Отмена
              </button>
            </>
          )}
        </div>
      )}

      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="bg-gray-800/90 hover:bg-gray-700 text-white p-2 rounded-full transition-colors backdrop-blur-sm border border-gray-600"
        aria-label="Закрыть"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

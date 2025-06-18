import React from 'react';

interface CampaignModalHeaderProps {
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

  return (
    <div className="absolute top-4 right-4 flex gap-2 z-10">
      {/* Кнопки действий для админов */}
      {canEdit && (
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={onEdit}
                className="bg-blue-600/90 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm border border-blue-500 text-sm font-medium"
              >
                ✏️ Редактировать
              </button>
              {!isCreateMode && onDelete && (
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
                {isSaving ? '⏳ Сохранение...' : isCreateMode ? '✅ Создать' : '💾 Сохранить'}
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
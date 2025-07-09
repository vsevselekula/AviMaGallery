'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Feedback,
  FeedbackStatus,
  FeedbackCategory,
  AttachmentData,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
} from '@/types/feedback';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useFeedback } from '@/hooks/useFeedback';

// Функция для рендеринга вложений
const renderAttachment = (attachment: string | AttachmentData) => {
  if (typeof attachment === 'string') {
    // Base64 изображение или URL
    return (
      <Image
        src={attachment}
        alt="Attachment"
        width={300}
        height={192}
        className="max-w-xs max-h-48 rounded border border-gray-600 object-cover"
      />
    );
  } else {
    // Объект с данными
    return (
      <Image
        src={attachment.data}
        alt={attachment.name || 'Attachment'}
        width={300}
        height={192}
        className="max-w-xs max-h-48 rounded border border-gray-600 object-cover"
      />
    );
  }
};

export default function FeedbackManagement() {
  const {
    feedback,
    loading,
    error,
    fetchFeedback,
    updateFeedbackStatus,
    updateFeedbackNotes,
    getStatusCounts,
    filterFeedback,
  } = useFeedback();

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>(
    'all'
  );
  const [filterCategory, setFilterCategory] = useState<
    FeedbackCategory | 'all'
  >('all');

  const filteredFeedback = filterFeedback(filterStatus, filterCategory);
  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
        <p className="text-red-300">{error}</p>
        <Button
          onClick={fetchFeedback}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
          <div className="text-2xl font-bold text-white">
            {statusCounts.all}
          </div>
          <div className="text-sm text-gray-300">Всего заявок</div>
        </div>
        <div className="bg-yellow-900/50 p-4 rounded-lg border border-yellow-700">
          <div className="text-2xl font-bold text-yellow-200">
            {statusCounts.new}
          </div>
          <div className="text-sm text-yellow-300">Новых</div>
        </div>
        <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-700">
          <div className="text-2xl font-bold text-blue-200">
            {statusCounts.in_progress}
          </div>
          <div className="text-sm text-blue-300">В работе</div>
        </div>
        <div className="bg-green-900/50 p-4 rounded-lg border border-green-700">
          <div className="text-2xl font-bold text-green-200">
            {statusCounts.completed}
          </div>
          <div className="text-sm text-green-300">Завершенных</div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Статус
          </label>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as FeedbackStatus | 'all')
            }
            className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все статусы</option>
            {Object.entries(FEEDBACK_STATUSES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Категория
          </label>
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as FeedbackCategory | 'all')
            }
            className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все категории</option>
            {Object.entries(FEEDBACK_CATEGORIES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Таблица заявок */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Заявка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredFeedback.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-400 truncate max-w-xs">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {item.user_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.user_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${FEEDBACK_CATEGORIES[item.category].color}`}
                    >
                      {FEEDBACK_CATEGORIES[item.category].icon}{' '}
                      {FEEDBACK_CATEGORIES[item.category].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${FEEDBACK_STATUSES[item.status].color}`}
                    >
                      {FEEDBACK_STATUSES[item.status].icon}{' '}
                      {FEEDBACK_STATUSES[item.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(item.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedFeedback(item);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Управлять
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFeedback.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              {feedback.length === 0
                ? 'Заявок пока нет'
                : 'Нет заявок по выбранным фильтрам'}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно управления заявкой */}
      {isModalOpen && selectedFeedback && (
        <FeedbackModal
          feedback={selectedFeedback}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFeedback(null);
          }}
          onUpdate={updateFeedbackStatus}
          onNotesChange={updateFeedbackNotes}
        />
      )}
    </div>
  );
}

// Модальное окно для управления заявкой
function FeedbackModal({
  feedback,
  onClose,
  onUpdate,
  onNotesChange,
}: {
  feedback: Feedback;
  onClose: () => void;
  onUpdate: (id: string, status: FeedbackStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
}) {
  const [status, setStatus] = useState<FeedbackStatus>(feedback.status);
  const [adminNotes, setAdminNotes] = useState(feedback.admin_notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(feedback.id, status);
    onNotesChange(feedback.id, adminNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Управление заявкой
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Информация о заявке */}
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h3 className="font-medium text-white mb-2">{feedback.title}</h3>
              <p className="text-gray-300 mb-3">{feedback.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>
                  От: {feedback.user_name} ({feedback.user_email})
                </span>
                <span>
                  Дата:{' '}
                  {new Date(feedback.created_at).toLocaleDateString('ru-RU')}
                </span>
                <span
                  className={`px-2 py-1 rounded-full ${FEEDBACK_CATEGORIES[feedback.category].color}`}
                >
                  {FEEDBACK_CATEGORIES[feedback.category].icon}{' '}
                  {FEEDBACK_CATEGORIES[feedback.category].label}
                </span>
              </div>
              {feedback.current_page && (
                <div className="mt-2 text-sm text-gray-400">
                  Страница: {feedback.current_page}
                </div>
              )}
              {feedback.attachments && feedback.attachments.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-2">Вложения:</div>
                  <div className="flex flex-wrap gap-2">
                    {feedback.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {renderAttachment(attachment)}
                        <span className="text-sm text-gray-400">
                          {typeof attachment === 'string'
                            ? `Вложение ${index + 1}`
                            : attachment.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Статус */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Статус
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(FEEDBACK_STATUSES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Заметки админа */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Комментарий для пользователя
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Добавьте комментарий (будет отправлен пользователю на email)"
                />
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 hover:text-white transition-colors border border-gray-600"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

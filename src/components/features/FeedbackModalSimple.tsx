'use client';

import { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FeedbackCategory, FEEDBACK_CATEGORIES, CreateFeedbackData } from '@/types/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function FeedbackModalSimple({ isOpen, onClose, onSuccess }: FeedbackModalProps) {
  const [formData, setFormData] = useState<CreateFeedbackData>({
    title: '',
    description: '',
    category: 'improvement'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const supabase = createClientComponentClient();

  // Обработка вставки из буфера обмена (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFileAdd(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Обработка drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        handleFileAdd(file);
      }
    });
  };

  const handleFileAdd = (file: File) => {
    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    // Проверяем количество файлов (максимум 3)
    if (attachments.length >= 3) {
      setError('Можно прикрепить максимум 3 файла');
      return;
    }

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setAttachments(prev => [...prev, { file, preview }]);
    };
    reader.readAsDataURL(file);
    
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(handleFileAdd);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Проверяем авторизацию
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Необходимо войти в систему для отправки заявки');
      }

      // Конвертируем файлы в base64 для хранения в БД (временное решение)
      const attachmentData = attachments.map(({ file, preview }) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        data: preview // base64 строка
      }));

      // Отправляем данные напрямую в Supabase
      const { data: feedback, error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          current_page: window.location.pathname,
          user_agent: navigator.userAgent,
          attachments: attachmentData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating feedback:', error);
        throw new Error('Ошибка при отправке заявки: ' + error.message);
      }

      // Сброс формы
      setFormData({
        title: '',
        description: '',
        category: 'improvement'
      });
      setAttachments([]);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className={`bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl ${
          isDragOver ? 'border-blue-500 border-2' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              💡 Предложить улучшение
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Категория */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Категория
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(FEEDBACK_CATEGORIES).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: key as FeedbackCategory }))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.category === key
                        ? 'border-blue-500 bg-blue-900/50 text-white'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Заголовок */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Заголовок *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Кратко опишите суть предложения"
              />
            </div>

            {/* Описание */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Описание *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Подробно опишите ваше предложение или проблему"
              />
            </div>

            {/* Вложения */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Скриншоты (необязательно)
              </label>
              
              {/* Зона загрузки */}
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="space-y-2">
                  <div className="text-gray-400">
                    📎 Перетащите изображения сюда или нажмите Ctrl+V
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Выбрать файлы
                  </button>
                  <div className="text-xs text-gray-500">
                    PNG, JPG, GIF до 5MB (максимум 3 файла)
                  </div>
                </div>
              </div>

              {/* Скрытый input для файлов */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Список прикрепленных файлов */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map(({ file, preview }, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded border border-gray-600">
                      <div className="flex items-center gap-2">
                        <img 
                          src={preview} 
                          alt={file.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-sm text-gray-300 truncate max-w-[150px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-400 hover:text-red-300 text-sm ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ошибка */}
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

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
                disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors disabled:hover:bg-blue-600"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  uploadCampaignImage,
  updateCampaignImage,
  isSupabaseStorageUrl,
} from '@/lib/storageUtils';
import {
  isImageFile,
  formatFileSize,
  getImageDimensions,
} from '@/lib/imageUtils';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onError?: (error: string) => void;
  campaignId: string; // Обязательный параметр для Storage
  maxSizeMB?: number;
  className?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onError,
  campaignId,
  maxSizeMB = 5,
  className = '',
  placeholder = 'Перетащите изображение или нажмите Ctrl+V',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [fileInfo, setFileInfo] = useState<{
    originalSize: number;
    dimensions: { width: number; height: number };
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    async (file: File) => {
      if (!isImageFile(file)) {
        onError?.('Пожалуйста, выберите файл изображения');
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        onError?.(`Размер файла не должен превышать ${maxSizeMB} МБ`);
        return;
      }

      setIsProcessing(true);

      try {
        // Получаем размеры оригинального изображения
        const originalDimensions = await getImageDimensions(file);

        // Загружаем в Supabase Storage
        const result =
          value && isSupabaseStorageUrl(value)
            ? await updateCampaignImage(file, campaignId, value)
            : await uploadCampaignImage(file, campaignId);

        if (result.error) {
          onError?.(result.error);
          return;
        }

        setPreviewUrl(result.url);
        setFileInfo({
          originalSize: file.size,
          dimensions: originalDimensions,
        });

        onChange(result.url);
      } catch (error) {
        console.error('Ошибка обработки изображения:', error);
        onError?.('Не удалось обработать изображение');
      } finally {
        setIsProcessing(false);
      }
    },
    [maxSizeMB, onChange, onError, campaignId, value]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processImage(files[0]);
      }
    },
    [processImage]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processImage(files[0]);
      }
    },
    [processImage]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setFileInfo(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await processImage(file);
          }
          break;
        }
      }
    },
    [processImage]
  );

  // Добавляем глобальный обработчик для Ctrl+V
  React.useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Проверяем, что не находимся в текстовом поле
      const activeElement = document.activeElement;
      const isInTextInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true');

      if (!isInTextInput) {
        handlePaste(e);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);

    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handlePaste]);

  const isCompactMode = className.includes('compact-mode');

  return (
    <div
      className={`${isCompactMode ? 'space-y-2' : 'space-y-4'} ${className}`}
    >
      {/* Зона загрузки */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg text-center cursor-pointer transition-all
          ${isCompactMode ? 'p-3' : 'p-6'}
          ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : isCompactMode
                ? 'border-white/30 bg-black/20 backdrop-blur-sm hover:border-white/50 hover:bg-black/30'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Загрузка в хранилище...
            </p>
          </div>
        ) : previewUrl ? (
          <div className={isCompactMode ? 'space-y-2' : 'space-y-4'}>
            <div className="relative inline-block">
              <Image
                src={previewUrl}
                alt="Предварительный просмотр"
                width={isCompactMode ? 150 : 300}
                height={isCompactMode ? 96 : 192}
                style={{
                  maxHeight: isCompactMode ? '6rem' : '12rem',
                  width: 'auto',
                  height: 'auto',
                }}
                className="rounded-lg shadow-md"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ×
              </button>
            </div>

            {fileInfo && !isCompactMode && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>
                  Размеры: {fileInfo.dimensions.width} ×{' '}
                  {fileInfo.dimensions.height} px
                </div>
                <div>
                  Исходный размер: {formatFileSize(fileInfo.originalSize)}
                </div>
                <div className="text-green-600 dark:text-green-400">
                  ✅ Сохранено в Supabase Storage
                </div>
              </div>
            )}

            {isCompactMode ? (
              <>
                <p className="text-xs text-white/80">Нажмите для замены</p>
                <p className="text-xs text-blue-300 font-medium">💡 Ctrl+V</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Нажмите для замены изображения
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  💡 Совет: можно вставить новое изображение из буфера обмена
                  (Ctrl+V)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className={isCompactMode ? 'space-y-1' : 'space-y-2'}>
            <div
              className={`${isCompactMode ? 'text-2xl' : 'text-4xl'} text-gray-400`}
            >
              📷
            </div>
            <p
              className={`${isCompactMode ? 'text-xs text-white/80' : 'text-sm text-gray-600 dark:text-gray-400'}`}
            >
              {placeholder}
            </p>
            {isCompactMode ? (
              <p className="text-xs text-blue-300 font-medium">💡 Ctrl+V</p>
            ) : (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Поддерживаются: JPG, PNG, WebP (до {maxSizeMB} МБ)
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  🔒 Изображения сохраняются в защищенном хранилище
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Альтернативный ввод URL */}
      <div className={isCompactMode ? 'space-y-1' : 'space-y-2'}>
        {!isCompactMode && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Или введите URL изображения:
          </label>
        )}
        <input
          type="url"
          value={value || ''}
          onChange={(e) => {
            const url = e.target.value;
            onChange(url);
            if (
              url &&
              (url.startsWith('http') || url.startsWith('data:image/'))
            ) {
              setPreviewUrl(url);
              setFileInfo(null);
            } else if (!url) {
              setPreviewUrl(null);
              setFileInfo(null);
            }
          }}
          placeholder={
            isCompactMode ? 'URL изображения' : 'https://example.com/image.jpg'
          }
          className={`w-full rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isCompactMode
              ? 'px-2 py-1 text-xs bg-black/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 hover:bg-black/30 focus:bg-black/40'
              : 'px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          }`}
        />
      </div>
    </div>
  );
}

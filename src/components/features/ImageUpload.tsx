import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  campaignId: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageUpload,
  campaignId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      // Загружаем файл в Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${campaignId}-${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('campaign-images')
        .upload(fileName, file);

      if (error) throw error;

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(fileName);

      onImageUpload(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке изображения');
    } finally {
      setIsUploading(false);
    }
  }, [campaignId, onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5242880, // 5MB
  });

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          await onDrop(dataTransfer.files);
        }
      }
    }
  }, [onDrop]);

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const urlInput = form.elements.namedItem('imageUrl') as HTMLInputElement;
    const url = urlInput.value.trim();

    if (!url) return;

    try {
      setIsUploading(true);
      setError(null);

      // Проверяем, что URL ведет на изображение
      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        throw new Error('URL должен вести на изображение');
      }

      onImageUpload(url);
      urlInput.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке изображения');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onPaste={handlePaste}
      >
        <input {...getInputProps()} disabled={isUploading} />
        {currentImage ? (
          <div className="relative">
            <img
              src={currentImage}
              alt="Текущее изображение"
              className="max-h-48 mx-auto rounded-lg"
            />
            <p className="mt-2 text-sm text-gray-500">
              Перетащите новое изображение или кликните для выбора
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-500">
              {isDragActive
                ? 'Отпустите файл здесь'
                : 'Перетащите изображение сюда или кликните для выбора'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Также можно вставить изображение из буфера обмена (Ctrl+V)
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <input
          type="url"
          name="imageUrl"
          placeholder="Или вставьте URL изображения"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isUploading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={isUploading}
        >
          Загрузить
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {isUploading && (
        <p className="text-blue-500 text-sm">Загрузка изображения...</p>
      )}
    </div>
  );
}; 
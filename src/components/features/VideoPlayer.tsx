import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  currentVideoType?: 'google_drive' | 'yandex_disk';
  onVideoTypeChange?: (type: 'google_drive' | 'yandex_disk' | undefined) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  currentVideoType,
  onVideoTypeChange,
}) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      setEmbedUrl('');
      setError(null);
      if (currentVideoType !== undefined) {
        onVideoTypeChange?.(undefined); // Сбрасываем тип, если нет видео
      }
      return;
    }

    try {
      let detectedType: 'google_drive' | 'yandex_disk' | undefined;
      if (videoUrl.includes('drive.google.com')) {
        const fileId = videoUrl.match(/[-\w]{25,}/)?.[0];
        if (!fileId) {
          throw new Error('Неверный формат ссылки Google Drive');
        }
        setEmbedUrl(`https://drive.google.com/file/d/${fileId}/preview`);
        detectedType = 'google_drive';
      } else if (videoUrl.includes('disk.yandex.ru')) {
        const fileId = videoUrl.match(/[a-zA-Z0-9_-]{11,}/)?.[0];
        if (!fileId) {
          throw new Error('Неверный формат ссылки Яндекс.Диск');
        }
        setEmbedUrl(`https://disk.yandex.ru/i/${fileId}`);
        detectedType = 'yandex_disk';
      } else {
        throw new Error('Неподдерживаемый формат ссылки');
      }

      if (detectedType !== currentVideoType) {
        onVideoTypeChange?.(detectedType);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обработке ссылки');
      setEmbedUrl('');
      if (currentVideoType !== undefined) {
        onVideoTypeChange?.(undefined); // Сбрасываем тип при ошибке
      }
    }
  }, [videoUrl, currentVideoType, onVideoTypeChange]);

  if (!videoUrl) {
    return null;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video">
      <iframe
        src={embedUrl}
        className={cn(
          "absolute inset-0 w-full h-full rounded-lg",
          "border-0"
        )}
        allow="autoplay"
        allowFullScreen
        title="Video player"
      />
    </div>
  );
}; 
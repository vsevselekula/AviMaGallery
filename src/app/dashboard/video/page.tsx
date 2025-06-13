'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function VideoPage() {
  const videoUrl =
    'https://drive.google.com/file/d/1BkNhlv5jjhgFLG0Swdh9csIhAbdayulU/preview'; // Используем /preview для встраивания
  const [randomImageUrl, setRandomImageUrl] = useState<string>('');

  const fetchRandomImage = () => {
    // Размеры изображения можно настроить, например, 1200x675 (соотношение 16:9)
    setRandomImageUrl(
      `https://source.unsplash.com/random/1200x675/?nature,abstract,technology&t=${Date.now()}`
    );
  };

  useEffect(() => {
    fetchRandomImage();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 p-4 sm:p-8 max-w-screen-xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Плеер видео</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Случайный стоп-кадр</h2>
        {randomImageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src={randomImageUrl}
              alt="Случайный стоп-кадр"
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}
        <button
          onClick={fetchRandomImage}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Обновить стоп-кадр
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Встроенное видео</h2>
        <div
          className="relative"
          style={{ paddingBottom: '56.25%', height: 0 }}
        >
          <iframe
            src={videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            title="Video Player"
          ></iframe>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Примечание: Видео встроено с Google Диска. Если возникнут проблемы с
          воспроизведением, возможно, потребуется получить прямую ссылку на
          видеофайл или изменить настройки доступа к файлу на Google Диске.
        </p>
      </div>
    </main>
  );
}

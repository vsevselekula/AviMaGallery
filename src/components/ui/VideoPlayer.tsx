'use client';

import React, { useState, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl?: string;
  posterUrl?: string;
  className?: string;
}

export function VideoPlayer({
  videoUrl,
  posterUrl,
  className = '',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Логирование для отладки

  // Проверяем, является ли это Google Drive ссылкой
  const isGoogleDriveUrl = videoUrl?.includes('drive.google.com');

  // Конвертируем Google Drive ссылку в embed формат
  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  };

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : '';

  const togglePlay = async () => {
    if (isGoogleDriveUrl) {
      // Для Google Drive iframe нельзя контролировать воспроизведение

      return;
    }

    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error playing video:', error);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!videoUrl) return null;

  return (
    <div className={`relative group ${className}`}>
      {/* Progressive Blur Background - ЗА плеером */}
      <div className="absolute -inset-12 z-0 rounded-2xl">
        {/* Слой с максимальным blur и градиентной маской */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            mask: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 80%)',
            WebkitMask:
              'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 80%)',
          }}
        />
        {/* Слой со средним blur */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            mask: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 90%)',
            WebkitMask:
              'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 90%)',
          }}
        />
        {/* Слой с легким blur */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            mask: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 60%, transparent 95%)',
            WebkitMask:
              'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 60%, transparent 95%)',
          }}
        />
        {/* Легкая тень для контраста */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, transparent 70%)',
          }}
        />
      </div>

      {/* Video Element */}
      <div className="relative z-10 aspect-video rounded-lg overflow-hidden shadow-2xl border border-white/20">
        {isGoogleDriveUrl ? (
          // Google Drive iframe
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            onMouseEnter={() => setShowControls(false)} // Скрываем наши контролы для iframe
            onMouseLeave={() => setShowControls(false)}
          />
        ) : (
          // Обычное видео
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={posterUrl}
            onPlay={() => {
              setIsPlaying(true);
            }}
            onPause={() => {
              setIsPlaying(false);
            }}
            onError={(e) => {
              console.error('Video error:', e);
            }}
            onLoadStart={() => {}}
            onCanPlay={() => {}}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            playsInline
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        )}

        {/* Video Controls Overlay - только для обычных видео */}
        {!isGoogleDriveUrl && (
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Play/Pause Button (Center) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
              >
                {isPlaying ? (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-white ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isPlaying ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isMuted ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import FeedbackModal from '@/components/features/FeedbackModalSimple';

export default function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    // Подписываемся на изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => {
          if (!isAuthenticated) {
            alert('Необходимо войти в систему для отправки предложений');
            return;
          }
          setIsModalOpen(true);
        }}
        className={`fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 group ${
          isAuthenticated
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-600 hover:bg-gray-500'
        }`}
        title={
          isAuthenticated
            ? 'Предложить улучшение'
            : 'Войдите в систему для отправки предложений'
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span className="hidden group-hover:block text-sm font-medium whitespace-nowrap">
            {isAuthenticated ? 'Предложить улучшение' : 'Требуется авторизация'}
          </span>
        </div>
      </button>

      {/* Уведомление об успехе */}
      {showSuccess && (
        <div className="fixed bottom-24 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-xl border border-green-500 z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span className="text-sm font-medium">Заявка отправлена!</span>
          </div>
        </div>
      )}

      {/* Модальное окно */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}

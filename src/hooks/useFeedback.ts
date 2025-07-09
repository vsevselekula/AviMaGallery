import { useState, useEffect, useCallback } from 'react';
import { Feedback, FeedbackStatus, FeedbackCategory } from '@/types/feedback';

interface UseFeedbackReturn {
  feedback: Feedback[];
  loading: boolean;
  error: string | null;
  fetchFeedback: () => Promise<void>;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => Promise<void>;
  updateFeedbackNotes: (id: string, notes: string) => Promise<void>;
  getStatusCounts: () => {
    all: number;
    new: number;
    in_progress: number;
    completed: number;
  };
  filterFeedback: (
    status: FeedbackStatus | 'all',
    category: FeedbackCategory | 'all'
  ) => Feedback[];
}

export function useFeedback(): UseFeedbackReturn {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/feedback');
      if (!response.ok) {
        throw new Error('Ошибка при загрузке заявок');
      }

      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFeedbackStatus = useCallback(
    async (id: string, status: FeedbackStatus) => {
      try {
        const response = await fetch(`/api/feedback/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error('Ошибка при обновлении статуса');
        }

        // Обновляем локальное состояние
        setFeedback((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      }
    },
    []
  );

  const updateFeedbackNotes = useCallback(async (id: string, notes: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_notes: notes }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении заметок');
      }

      // Обновляем локальное состояние
      setFeedback((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, admin_notes: notes } : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  }, []);

  const getStatusCounts = useCallback(() => {
    return {
      all: feedback.length,
      new: feedback.filter((item) => item.status === 'new').length,
      in_progress: feedback.filter((item) => item.status === 'in_progress')
        .length,
      completed: feedback.filter((item) => item.status === 'completed').length,
    };
  }, [feedback]);

  const filterFeedback = useCallback(
    (status: FeedbackStatus | 'all', category: FeedbackCategory | 'all') => {
      return feedback.filter((item) => {
        const statusMatch = status === 'all' || item.status === status;
        const categoryMatch = category === 'all' || item.category === category;
        return statusMatch && categoryMatch;
      });
    },
    [feedback]
  );

  // Загружаем данные при монтировании
  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  return {
    feedback,
    loading,
    error,
    fetchFeedback,
    updateFeedbackStatus,
    updateFeedbackNotes,
    getStatusCounts,
    filterFeedback,
  };
}

export type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'other';
export type FeedbackStatus = 'new' | 'in_progress' | 'completed';

export interface AttachmentData {
  name: string;
  size: number;
  type: string;
  data: string; // base64 строка
}

export interface Feedback {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  current_page?: string;
  user_agent?: string;
  attachments: (string | AttachmentData)[]; // URLs файлов или base64 данные
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  // Дополнительные поля для отображения
  user_email?: string;
  user_name?: string;
}

export interface CreateFeedbackData {
  title: string;
  description: string;
  category: FeedbackCategory;
  current_page?: string;
  user_agent?: string;
  attachments?: File[];
}

export interface UpdateFeedbackData {
  status?: FeedbackStatus;
  admin_notes?: string;
}

export const FEEDBACK_CATEGORIES: Record<FeedbackCategory, { label: string; icon: string; color: string }> = {
  bug: {
    label: 'Ошибка',
    icon: '🐛',
    color: 'bg-red-100 text-red-800'
  },
  feature: {
    label: 'Новая функция',
    icon: '✨',
    color: 'bg-blue-100 text-blue-800'
  },
  improvement: {
    label: 'Улучшение',
    icon: '🚀',
    color: 'bg-green-100 text-green-800'
  },
  other: {
    label: 'Другое',
    icon: '💭',
    color: 'bg-gray-100 text-gray-800'
  }
};

export const FEEDBACK_STATUSES: Record<FeedbackStatus, { label: string; icon: string; color: string }> = {
  new: {
    label: 'Новая',
    icon: '🆕',
    color: 'bg-yellow-100 text-yellow-800'
  },
  in_progress: {
    label: 'В работе',
    icon: '⚙️',
    color: 'bg-blue-100 text-blue-800'
  },
  completed: {
    label: 'Выполнено',
    icon: '✅',
    color: 'bg-green-100 text-green-800'
  }
}; 
-- Создание таблицы для обратной связи
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('bug', 'feature', 'improvement', 'other')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  current_page text,
  user_agent text,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  admin_notes text,
  CONSTRAINT feedback_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_feedback_updated_at ON public.feedback;
CREATE TRIGGER trigger_update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- Включаем RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут читать только свои заявки
CREATE POLICY "Users can read own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать заявки
CREATE POLICY "Users can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять только свои заявки (только некоторые поля)
CREATE POLICY "Users can update own feedback" ON public.feedback
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Политика: админы могут читать все заявки
CREATE POLICY "Admins can read all feedback" ON public.feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: админы могут обновлять все заявки
CREATE POLICY "Admins can update all feedback" ON public.feedback
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: админы могут удалять заявки
CREATE POLICY "Admins can delete feedback" ON public.feedback
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Комментарии для документации
COMMENT ON TABLE public.feedback IS 'Таблица для хранения обратной связи и предложений пользователей';
COMMENT ON COLUMN public.feedback.category IS 'Категория: bug, feature, improvement, other';
COMMENT ON COLUMN public.feedback.status IS 'Статус: new, in_progress, completed';
COMMENT ON COLUMN public.feedback.attachments IS 'JSON массив с URL файлов-вложений'; 
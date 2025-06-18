-- Создание таблицы типов кампаний
CREATE TABLE IF NOT EXISTS public.campaign_types (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT campaign_types_pkey PRIMARY KEY (id)
);

-- Вставляем стандартные типы кампаний
INSERT INTO public.campaign_types (name, description, sort_order) VALUES
  ('T1', 'Тип кампании T1', 1),
  ('T2', 'Тип кампании T2', 2)
ON CONFLICT (name) DO NOTHING;

-- Создаем RLS политики
ALTER TABLE public.campaign_types ENABLE ROW LEVEL SECURITY;

-- Политика для чтения - все аутентифицированные пользователи
CREATE POLICY "Enable read access for authenticated users" ON public.campaign_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- Политика для записи - только super_admin
CREATE POLICY "Enable write access for super_admin" ON public.campaign_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_campaign_types_updated_at 
  BEFORE UPDATE ON public.campaign_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
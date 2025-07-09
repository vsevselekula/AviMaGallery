-- SQL скрипт для создания системы реакций к кампаниям
-- Выполнять в PostgreSQL для Supabase

-- 1. СОЗДАНИЕ ТАБЛИЦЫ РЕАКЦИЙ
CREATE TABLE IF NOT EXISTS public.campaign_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns_v2(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'clap', 'thinking', 'wow')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ограничение: один пользователь может поставить только одну реакцию на кампанию
  UNIQUE(campaign_id, user_id)
);

-- 2. СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
CREATE INDEX IF NOT EXISTS idx_campaign_reactions_campaign_id ON public.campaign_reactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_reactions_user_id ON public.campaign_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_reactions_type ON public.campaign_reactions(reaction_type);
CREATE INDEX IF NOT EXISTS idx_campaign_reactions_created_at ON public.campaign_reactions(created_at);

-- 3. НАСТРОЙКА RLS (Row Level Security)
ALTER TABLE public.campaign_reactions ENABLE ROW LEVEL SECURITY;

-- Политика для чтения реакций (все могут видеть)
CREATE POLICY "Enable read access for all users" ON public.campaign_reactions
    FOR SELECT
    USING (true);

-- Политика для создания реакций (только авторизованные пользователи)
CREATE POLICY "Enable insert for authenticated users" ON public.campaign_reactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Политика для обновления реакций (только свои)
CREATE POLICY "Enable update for own reactions" ON public.campaign_reactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Политика для удаления реакций (только свои)
CREATE POLICY "Enable delete for own reactions" ON public.campaign_reactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- 4. СОЗДАНИЕ ФУНКЦИИ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. СОЗДАНИЕ ТРИГГЕРА ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
CREATE TRIGGER update_campaign_reactions_updated_at 
    BEFORE UPDATE ON public.campaign_reactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. СОЗДАНИЕ VIEW ДЛЯ АГРЕГАЦИИ РЕАКЦИЙ ПО КАМПАНИЯМ
CREATE OR REPLACE VIEW campaign_reactions_summary AS
SELECT 
    campaign_id,
    reaction_type,
    COUNT(*) as count,
    array_agg(user_id) as user_ids
FROM public.campaign_reactions
GROUP BY campaign_id, reaction_type;

-- 7. ПРОВЕРКА СОЗДАНИЯ ТАБЛИЦЫ
SELECT 
    'campaign_reactions table created successfully' as status,
    COUNT(*) as initial_count 
FROM public.campaign_reactions;

-- 8. ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ (для тестирования)
/*
-- Добавить реакцию
INSERT INTO public.campaign_reactions (campaign_id, user_id, reaction_type)
VALUES ('your-campaign-id', auth.uid(), 'like');

-- Изменить реакцию
UPDATE public.campaign_reactions 
SET reaction_type = 'love' 
WHERE campaign_id = 'your-campaign-id' AND user_id = auth.uid();

-- Удалить реакцию
DELETE FROM public.campaign_reactions 
WHERE campaign_id = 'your-campaign-id' AND user_id = auth.uid();

-- Получить все реакции для кампании
SELECT 
    reaction_type,
    COUNT(*) as count
FROM public.campaign_reactions 
WHERE campaign_id = 'your-campaign-id'
GROUP BY reaction_type;
*/ 
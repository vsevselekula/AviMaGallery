-- Создание таблицы campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT,
    start_date DATE,
    end_date DATE,
    vertical_id UUID REFERENCES public.verticals(id),
    budget DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS campaigns_vertical_id_idx ON public.campaigns(vertical_id);
CREATE INDEX IF NOT EXISTS campaigns_start_date_idx ON public.campaigns(start_date);
CREATE INDEX IF NOT EXISTS campaigns_end_date_idx ON public.campaigns(end_date);

-- Добавление RLS политик
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Политика для просмотра кампаний
CREATE POLICY "Enable read access for all users" ON public.campaigns
    FOR SELECT
    USING (true);

-- Политика для создания кампаний (только для админов)
CREATE POLICY "Enable insert for admins only" ON public.campaigns
    FOR INSERT
    WITH CHECK (
        auth.role() = 'admin' OR 
        auth.role() = 'super_admin'
    );

-- Политика для обновления кампаний (только для админов)
CREATE POLICY "Enable update for admins only" ON public.campaigns
    FOR UPDATE
    USING (
        auth.role() = 'admin' OR 
        auth.role() = 'super_admin'
    );

-- Политика для удаления кампаний (только для админов)
CREATE POLICY "Enable delete for admins only" ON public.campaigns
    FOR DELETE
    USING (
        auth.role() = 'admin' OR 
        auth.role() = 'super_admin'
    ); 
-- Создание bucket для изображений кампаний
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'campaign-images', true);

-- Политики для bucket campaign-images
-- Разрешить всем читать файлы (публичный доступ)
CREATE POLICY "Public read access for campaign-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-images');

-- Разрешить аутентифицированным пользователям загружать файлы
CREATE POLICY "Authenticated users can upload to campaign-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-images');

-- Разрешить аутентифицированным пользователям обновлять файлы
CREATE POLICY "Authenticated users can update campaign-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-images');

-- Разрешить аутентифицированным пользователям удалять файлы
CREATE POLICY "Authenticated users can delete from campaign-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'campaign-images'); 
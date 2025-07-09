-- Создание bucket для хранения вложений обратной связи
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true,
  5242880, -- 5MB в байтах
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Политики доступа для bucket attachments
-- Пользователи могут загружать файлы
CREATE POLICY "Users can upload feedback attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Все могут просматривать файлы (так как bucket публичный)
CREATE POLICY "Anyone can view feedback attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');

-- Пользователи могут удалять только свои файлы
CREATE POLICY "Users can delete own feedback attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Админы могут удалять любые файлы
CREATE POLICY "Admins can delete any feedback attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ); 
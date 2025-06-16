-- RLS политики для таблицы campaigns_v2
-- Разрешаем супер-админам удалять кампании

-- Сначала включаем RLS для таблицы (если еще не включен)
ALTER TABLE campaigns_v2 ENABLE ROW LEVEL SECURITY;

-- Политика для чтения кампаний (для всех аутентифицированных пользователей)
CREATE POLICY "Allow authenticated users to read campaigns" ON campaigns_v2
    FOR SELECT
    TO authenticated
    USING (true);

-- Политика для создания кампаний (для super_admin и editor)
CREATE POLICY "Allow super_admin and editor to insert campaigns" ON campaigns_v2
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'editor')
        )
    );

-- Политика для обновления кампаний (для super_admin и editor)
CREATE POLICY "Allow super_admin and editor to update campaigns" ON campaigns_v2
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'editor')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'editor')
        )
    );

-- Политика для удаления кампаний (ТОЛЬКО для super_admin)
CREATE POLICY "Allow super_admin to delete campaigns" ON campaigns_v2
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Показать все политики для таблицы campaigns_v2
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'campaigns_v2'; 
-- Функция для проверки наличия активного MFA для администраторов
CREATE OR REPLACE FUNCTION require_mfa_for_admins()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем роль пользователя
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    -- Проверяем наличие активного MFA фактора
    IF NOT EXISTS (
      SELECT 1 FROM auth.mfa_factors 
      WHERE user_id = auth.uid() 
      AND status = 'verified'
      AND factor_type = 'totp'
    ) THEN
      RAISE EXCEPTION 'Администраторы должны использовать двухфакторную аутентификацию';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для проверки MFA при выполнении критических операций
-- Можно применить к таблицам campaigns, user_roles и другим важным операциям

-- Комментарий: Этот триггер можно включить при необходимости
-- CREATE TRIGGER enforce_admin_mfa_campaigns
--   BEFORE INSERT OR UPDATE OR DELETE ON campaigns
--   FOR EACH ROW 
--   WHEN (auth.role() = 'authenticated')
--   EXECUTE FUNCTION require_mfa_for_admins();

-- CREATE TRIGGER enforce_admin_mfa_user_roles
--   BEFORE INSERT OR UPDATE OR DELETE ON user_roles
--   FOR EACH ROW 
--   WHEN (auth.role() = 'authenticated')
--   EXECUTE FUNCTION require_mfa_for_admins();

-- Функция для проверки статуса MFA пользователя (утилита)
CREATE OR REPLACE FUNCTION check_user_mfa_status(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.mfa_factors 
    WHERE user_id = user_uuid 
    AND status = 'verified'
    AND factor_type = 'totp'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения информации о MFA пользователя
CREATE OR REPLACE FUNCTION get_user_mfa_info(user_uuid UUID)
RETURNS TABLE(
  has_mfa BOOLEAN,
  factor_count INTEGER,
  last_verified_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM auth.mfa_factors WHERE user_id = user_uuid AND status = 'verified') as has_mfa,
    (SELECT COUNT(*)::INTEGER FROM auth.mfa_factors WHERE user_id = user_uuid AND status = 'verified') as factor_count,
    (SELECT MAX(updated_at) FROM auth.mfa_factors WHERE user_id = user_uuid AND status = 'verified') as last_verified_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарии для отката миграции:
-- DROP TRIGGER IF EXISTS enforce_admin_mfa_campaigns ON campaigns;
-- DROP TRIGGER IF EXISTS enforce_admin_mfa_user_roles ON user_roles;
-- DROP FUNCTION IF EXISTS require_mfa_for_admins();
-- DROP FUNCTION IF EXISTS check_user_mfa_status(UUID);
-- DROP FUNCTION IF EXISTS get_user_mfa_info(UUID); 
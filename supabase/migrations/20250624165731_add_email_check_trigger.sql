-- Эта функция проверяет, что email нового пользователя заканчивается на @avito.ru
create or replace function public.check_avito_email_domain()
returns trigger as $$
begin
  if not new.email ~* '^[A-Za-z0-9._%+-]+@avito\.ru$' then
    raise exception 'Регистрация возможна только с использованием почты @avito.ru';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Этот триггер вызывает нашу функцию перед вставкой нового пользователя в auth.users
create trigger ensure_avito_domain_on_signup
  before insert on auth.users
  for each row execute procedure public.check_avito_email_domain();

-- Команды для отката миграции (если понадобится)
-- DROP TRIGGER IF EXISTS ensure_avito_domain_on_signup ON auth.users;
-- DROP FUNCTION IF EXISTS public.check_avito_email_domain();
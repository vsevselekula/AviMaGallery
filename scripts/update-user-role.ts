import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Загружаем переменные окружения из .env.local
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\nMissing environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL is missing');
  if (!supabaseServiceKey)
    console.error('- SUPABASE_SERVICE_ROLE_KEY is missing');
  process.exit(1);
}

// Создаем клиент с service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function updateUserRole(email: string) {
  try {
    // Получаем список всех пользователей
    const { data: allUsers, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    // Находим пользователя по email
    const user = allUsers?.users.find((u) => u.email === email);
    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    // Проверяем существование записи в таблице user_roles
    const { data: existingRole, error: fetchError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing role:', fetchError);
      return;
    }

    if (existingRole) {
      // Обновляем существующую роль
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: 'super_admin' })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating role:', updateError);
      } else {
        console.log(
          `Successfully updated role to super_admin for user ${email}`
        );
      }
    } else {
      // Создаем новую запись с ролью
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'super_admin' });

      if (insertError) {
        console.error('Error inserting role:', insertError);
      } else {
        console.log(`Successfully created super_admin role for user ${email}`);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Получаем email из аргументов командной строки
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument');
  process.exit(1);
}

updateUserRole(email)
  .then(() => {
    console.log('Finished updating user role');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

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

async function updateAdminRole() {
  try {
    // Получаем список всех пользователей
    const { data: allUsers, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    // Находим пользователя с email admin@test.com
    const adminUser = allUsers?.users.find((u) => u.email === 'admin@test.com');
    if (!adminUser) {
      console.error('Admin user not found');
      return;
    }

    // Обновляем роль в таблице user_roles
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({ role: 'super_admin' })
      .eq('user_id', adminUser.id);

    if (updateError) {
      console.error('Error updating role:', updateError);
    } else {
      console.log('Successfully updated admin role to super_admin');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

updateAdminRole()
  .then(() => {
    console.log('Finished updating admin role');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

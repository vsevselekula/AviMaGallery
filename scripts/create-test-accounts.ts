import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Загружаем переменные окружения из .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading .env file from:', envPath);
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

const testAccounts = [
  {
    email: 'viewer@avito.ru',
    password: 'viewer123',
    role: 'viewer',
  },
  {
    email: 'editor@avito.ru',
    password: 'editor123',
    role: 'editor',
  },
  {
    email: 'admin@avito.ru',
    password: 'admin123',
    role: 'super_admin',
  },
];

async function createTestAccounts() {
  for (const account of testAccounts) {
    try {
      // Проверяем существование пользователя в auth.users
      const { data: allUsers, error: listError } =
        await supabase.auth.admin.listUsers();
      if (listError) {
        console.error(`Error listing users:`, listError);
        continue;
      }
      const existingAuthUser = allUsers?.users.find(
        (u) => u.email === account.email
      );
      let userId: string;

      if (existingAuthUser) {
        userId = existingAuthUser.id;
        console.log(`User ${account.email} already exists in auth.users.`);
      } else {
        // Создаем нового пользователя в auth.users
        const { data: newUser, error: signUpError } =
          await supabase.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
            user_metadata: { role: account.role },
          });
        if (signUpError) {
          console.error(`Error creating user ${account.email}:`, signUpError);
          continue;
        }
        userId = newUser.user.id;
        console.log(`Created new user ${account.email} in auth.users.`);
      }

      // Проверяем существование роли пользователя в таблице 'user_roles'
      const { data: existingRole, error: fetchRoleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchRoleError && fetchRoleError.code !== 'PGRST116') {
        // PGRST116 is 'No rows found'
        console.error(
          `Error fetching role for ${account.email}:`,
          fetchRoleError
        );
        continue;
      }

      if (existingRole) {
        // Обновляем существующую роль
        const { error: updateRoleError } = await supabase
          .from('user_roles')
          .update({
            role: account.role,
          })
          .eq('user_id', userId);

        if (updateRoleError) {
          console.error(
            `Error updating role for ${account.email}:`,
            updateRoleError
          );
        } else {
          console.log(`Updated role for ${account.email} in user_roles table.`);
        }
      } else {
        // Создаем новую роль
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: account.role,
          });

        if (insertRoleError) {
          console.error(
            `Error inserting role for ${account.email}:`,
            insertRoleError
          );
        } else {
          console.log(
            `Inserted role for ${account.email} in user_roles table.`
          );
        }
      }
    } catch (error) {
      console.error(`Unexpected error for ${account.email}:`, error);
    }
  }
}

createTestAccounts()
  .then(() => {
    console.log('Finished creating/updating test accounts');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

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

const usersToDelete = ['viewer@avito.ru', 'editor@avito.ru', 'admin@avito.ru'];

async function deleteTestUsers() {
  for (const email of usersToDelete) {
    try {
      // Получаем ID пользователя по email
      const { data: userList, error: listError } =
        await supabase.auth.admin.listUsers();
      if (listError) {
        console.error(`Error listing users to delete ${email}:`, listError);
        continue;
      }
      const user = userList?.users.find((u) => u.email === email);

      if (user) {
        console.log(`Attempting to delete user: ${email} with ID: ${user.id}`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          user.id
        );
        if (deleteError) {
          console.error(`Error deleting user ${email}:`, deleteError);
        } else {
          console.log(`Successfully deleted user: ${email}`);
        }
      } else {
        console.log(`User ${email} not found, skipping deletion.`);
      }
    } catch (error) {
      console.error(`Unexpected error deleting user ${email}:`, error);
    }
  }
}

deleteTestUsers()
  .then(() => {
    console.log('Finished deleting test users.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

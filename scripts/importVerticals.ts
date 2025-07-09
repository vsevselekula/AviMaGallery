import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Замените эти значения на ваши из Supabase Project Settings -> API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const verticalsFilePath = resolve(process.cwd(), 'src/data/verticals.json');

async function importVerticals() {
  try {
    const verticalsData = JSON.parse(readFileSync(verticalsFilePath, 'utf-8'));
    console.log(`Найдено ${verticalsData.length} вертикалей для импорта.`);

    for (const vertical of verticalsData) {
      // Убедимся, что team_members корректно преобразуется в JSONB
      const { data, error } = await supabase.from('verticals').upsert(
        {
          id: vertical.id,
          name: vertical.name,
          description: vertical.description,
          main_image: vertical.main_image,
          team_members: vertical.team_members, // Supabase автоматически обработает как JSONB
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );

      if (error) {
        console.error(
          `Ошибка при импорте вертикали ${vertical.name}:`,
          error.message
        );
      } else {
        console.log(
          `Успешно импортирована/обновлена вертикаль: ${vertical.name}`
        );
      }
    }
    console.log('Импорт вертикалей завершен.');
  } catch (error) {
    console.error('Ошибка при импорте вертикалей:', error);
  }
}

importVerticals();

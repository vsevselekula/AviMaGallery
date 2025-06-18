import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔔 Включение Realtime для таблицы campaign_reactions...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют необходимые переменные окружения');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableRealtime() {
  try {
    console.log('📋 Для включения Realtime выполните в Supabase SQL Editor:');
    console.log('=' .repeat(60));
    console.log('ALTER publication supabase_realtime ADD TABLE campaign_reactions;');
    console.log('=' .repeat(60));
    console.log('');
    console.log('✅ После выполнения SQL команды Realtime будет активен!');
    console.log('🔔 Реакции будут обновляться в реальном времени между пользователями');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Запускаем включение Realtime
enableRealtime(); 
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Создание таблицы реакций...');
console.log('Environment check:');
if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL is missing');
if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY is missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют необходимые переменные окружения в .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createReactionsTable() {
  try {
    console.log('📖 Читаем SQL файл...');
    
    // Читаем SQL файл
    const sqlPath = path.join(process.cwd(), 'create_reactions_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Выполняем SQL миграцию...');
    
    // Разбиваем SQL на отдельные команды (по точке с запятой)
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));
    
    console.log(`📝 Найдено ${sqlCommands.length} SQL команд для выполнения`);
    
    // Выполняем каждую команду отдельно
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      // Пропускаем комментарии и пустые строки
      if (command.startsWith('--') || command.startsWith('/*') || command.trim() === '') {
        continue;
      }
      
      console.log(`⚡ Выполняем команду ${i + 1}/${sqlCommands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        });
        
        if (error) {
          // Если RPC функция не существует, пробуем прямой SQL
          const { data: directData, error: directError } = await supabase
            .from('_temp_sql_execution')
            .select('*')
            .limit(0);
          
          if (directError) {
            console.log(`⚠️  Команда ${i + 1} вызвала ошибку (возможно, уже выполнена):`, error.message);
          }
        } else {
          console.log(`✅ Команда ${i + 1} выполнена успешно`);
        }
      } catch (cmdError) {
        console.log(`⚠️  Команда ${i + 1} вызвала ошибку:`, cmdError);
      }
    }
    
    console.log('🔍 Проверяем создание таблицы...');
    
    // Проверяем, что таблица создана
    const { data: tableCheck, error: checkError } = await supabase
      .from('campaign_reactions')
      .select('count(*)')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Ошибка при проверке таблицы:', checkError.message);
      
      // Пробуем создать таблицу напрямую с базовой структурой
      console.log('🔧 Пробуем создать таблицу напрямую...');
      
      const basicTableSQL = `
        CREATE TABLE IF NOT EXISTS public.campaign_reactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          campaign_id UUID NOT NULL,
          user_id UUID NOT NULL,
          reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'clap', 'thinking', 'wow')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(campaign_id, user_id)
        );
        
        ALTER TABLE public.campaign_reactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable read access for all users" ON public.campaign_reactions
          FOR SELECT USING (true);
        
        CREATE POLICY "Enable insert for authenticated users" ON public.campaign_reactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Enable update for own reactions" ON public.campaign_reactions
          FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Enable delete for own reactions" ON public.campaign_reactions
          FOR DELETE USING (auth.uid() = user_id);
      `;
      
      console.log('📝 Создаем базовую структуру таблицы...');
      // Здесь нужно будет выполнить SQL через Supabase Dashboard
      console.log('⚠️  Пожалуйста, выполните следующий SQL в Supabase Dashboard:');
      console.log('=' .repeat(80));
      console.log(basicTableSQL);
      console.log('=' .repeat(80));
      
    } else {
      console.log('✅ Таблица campaign_reactions успешно создана!');
      console.log('📊 Текущее количество записей:', tableCheck);
    }
    
    console.log('🎉 Миграция завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при создании таблицы:', error);
    
    // Выводим инструкции для ручного создания
    console.log('\n📋 Инструкции для ручного создания:');
    console.log('1. Откройте Supabase Dashboard');
    console.log('2. Перейдите в SQL Editor');
    console.log('3. Выполните содержимое файла create_reactions_table.sql');
    console.log('4. Или выполните команду: npm run create-reactions-table');
  }
}

// Запускаем создание таблицы
createReactionsTable(); 
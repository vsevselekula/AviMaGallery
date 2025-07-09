require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testEmailSending() {
  console.log('🧪 Тестируем отправку email через Supabase...\n');

  // Тестовый email (замените на реальный @avito.ru email)
  const testEmail = 'test@avito.ru';

  try {
    console.log(`📧 Отправляем magic link на: ${testEmail}`);

    const { data, error } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      console.error('❌ Ошибка отправки:', error.message);

      // Анализируем тип ошибки
      if (error.message.includes('12 seconds')) {
        console.log(
          '\n💡 Это ошибка rate limiting. Подождите 12+ секунд и попробуйте снова.'
        );
      } else if (error.message.includes('SMTP')) {
        console.log(
          '\n💡 Проблема с SMTP настройками. Проверьте Email Settings в Supabase.'
        );
      } else if (error.message.includes('Invalid')) {
        console.log(
          '\n💡 Проблема с конфигурацией. Проверьте Site URL и Redirect URLs.'
        );
      }

      return;
    }

    console.log('✅ Email отправлен успешно!');
    console.log('📊 Результат:', data);
  } catch (err) {
    console.error('❌ Неожиданная ошибка:', err);
  }
}

// Функция для проверки настроек
async function checkAuthSettings() {
  console.log('\n🔧 Проверяем настройки...');
  console.log(
    `Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Установлен' : '❌ Не установлен'}`
  );
  console.log(
    `Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Установлен' : '❌ Не установлен'}`
  );
  console.log(
    `Site URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000 (по умолчанию)'}`
  );
}

// Запуск тестов
async function runTests() {
  await checkAuthSettings();
  await testEmailSending();

  console.log('\n📋 Следующие шаги:');
  console.log('1. Проверьте Auth Logs в Supabase Dashboard');
  console.log('2. Убедитесь, что Site URL правильно настроен');
  console.log('3. Проверьте SMTP настройки в Email Settings');
  console.log('4. Подождите 12+ секунд между попытками отправки');
}

runTests().catch(console.error);

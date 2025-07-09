
'use client';

import { useState } from 'react';
import { Setup2FADiagnostic } from '@/components/features/auth/Setup2FADiagnostic';
import { Setup2FA } from '@/components/features/auth/Setup2FA';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export default function Test2FAPage() {
  const [mode, setMode] = useState<'diagnostic' | 'setup'>('diagnostic');
  const [testResult, setTestResult] = useState<string>('');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const cleanupProblematicFactors = async () => {
    setIsCleaningUp(true);
    const deleteResults: string[] = [];

    try {
      const { data: allFactors } = await supabase.auth.mfa.listFactors();
      
      if (!allFactors) {
        deleteResults.push('❌ Не удалось получить список факторов');
        setTestResult(deleteResults.join('\n'));
        return;
      }

      deleteResults.push('🔍 Поиск проблемных факторов...');

      // Ищем все типы факторов, не только TOTP
      const allFactorTypes = ['totp', 'phone', 'webauthn'] as const;
      const problematicFactors: Array<{ id: string; type: string; name?: string; status: string }> = [];

                    for (const factorType of allFactorTypes) {
          const factors = (allFactors as Record<string, unknown>)[factorType] as Array<{
            id: string;
            friendly_name?: string;
            status: string;
          }> || [];
          factors.forEach((factor) => {
          // Проблемные факторы:
          // 1. Факторы без имени или с пустым именем
          // 2. Факторы с статусом unverified
          if (!factor.friendly_name || 
              factor.friendly_name.trim() === '' || 
              factor.status === 'unverified') {
            problematicFactors.push({
              id: factor.id,
              type: factorType,
              name: factor.friendly_name || 'без названия',
              status: factor.status
            });
          }
        });
      }

      if (problematicFactors.length === 0) {
        deleteResults.push('✅ Проблемных факторов не найдено');
        setTestResult(deleteResults.join('\n'));
        return;
      }

      deleteResults.push(`🚨 Найдено ${problematicFactors.length} проблемных факторов:`);
      problematicFactors.forEach((factor, index) => {
        deleteResults.push(`  ${index + 1}. ID: ${factor.id}, Тип: ${factor.type}, Имя: "${factor.name}", Статус: ${factor.status}`);
      });

      if (window.confirm(`Найдено ${problematicFactors.length} проблемных факторов. Удалить их?`)) {
        deleteResults.push('🗑️ Начинаем удаление...');
        
        for (const factor of problematicFactors) {
          try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
            if (error) {
              deleteResults.push(`❌ Ошибка удаления ${factor.id}: ${error.message}`);
            } else {
              deleteResults.push(`✅ Удален: ${factor.type} "${factor.name}"`);
            }
          } catch (delError) {
            deleteResults.push(`❌ Исключение при удалении ${factor.id}: ${delError}`);
          }
        }
        
        deleteResults.push('✅ Очистка завершена');
      } else {
        deleteResults.push('❌ Удаление отменено пользователем');
      }

    } catch (error) {
      deleteResults.push(`❌ Ошибка очистки: ${error}`);
    } finally {
      setTestResult(deleteResults.join('\n'));
      setIsCleaningUp(false);
    }
  };

  const runDetailedTest = async () => {
    setIsTestRunning(true);
    setTestResult('');
    
    try {
      logger.auth.info('=== Детальный тест MFA API ===');
      
      // 1. Проверяем пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setTestResult('❌ Пользователь не аутентифицирован');
        return;
      }
      
      // 2. Проверяем существующие факторы
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) {
        setTestResult(`❌ Ошибка получения факторов: ${listError.message}`);
        return;
      }
      
      const totpFactors = factors?.totp || [];
      const phoneFactors = factors?.phone || [];
      const allFactors = factors?.all || [];
      
      let factorInfo = `✅ Пользователь: ${user.email}\n`;
      factorInfo += `📊 TOTP факторов: ${totpFactors.length}\n`;
      factorInfo += `📱 Phone факторов: ${phoneFactors.length}\n`;
      factorInfo += `🔢 Всего факторов: ${allFactors.length}`;
      
      if (allFactors.length > 0) {
        factorInfo += '\n\n🔍 Детали всех факторов:';
        allFactors.forEach((factor, index) => {
          factorInfo += `\n  ${index + 1}. ID: ${factor.id}`;
          factorInfo += `\n     Тип: ${factor.factor_type}`;
          factorInfo += `\n     Имя: "${factor.friendly_name || ''}"`;
          factorInfo += `\n     Статус: ${factor.status}`;
        });
      }
      
      setTestResult(factorInfo);
      
      // 3. Пробуем создать фактор
      try {
        const enrollResult = await supabase.auth.mfa.enroll({
          factorType: 'totp',
        });
        
        if (enrollResult.error) {
                  // Детальный анализ ошибки
        const error = enrollResult.error as {
          message: string;
          status?: number;
          code?: string;
        };
        let errorDetails = `❌ Enroll ошибка: ${error.message}`;
        
        if (error.status) {
          errorDetails += `\n🔢 HTTP Status: ${error.status}`;
        }
        
        if (error.code) {
          errorDetails += `\n🏷️ Error Code: ${error.code}`;
        }
          
          // Проверяем специфические случаи
          if (error.message.includes('already enrolled') || error.message.includes('already exists')) {
            errorDetails += '\n💡 Возможно, у пользователя уже есть максимальное количество факторов';
          } else if (error.status === 422 && error.code === 'mfa_factor_name_conflict') {
            errorDetails += '\n🔧 РЕШЕНИЕ: Найден конфликт имен факторов!';
            errorDetails += '\n  Используйте кнопку "🗑️ Очистить проблемные факторы" ниже';
          } else if (error.status === 422) {
            errorDetails += '\n💡 422 ошибка может означать:\n  - Неправильный формат запроса\n  - Лимит факторов превышен\n  - Конфликт с существующими факторами';
          }
          
          setTestResult(prev => prev + '\n\n' + errorDetails);
        } else {
          // Успешно создан, сразу удаляем тестовый фактор
          if (enrollResult.data?.id) {
            await supabase.auth.mfa.unenroll({ factorId: enrollResult.data.id });
            setTestResult(prev => prev + '\n\n✅ MFA Enroll API работает отлично!\n🗑️ Тестовый фактор удален');
          }
        }
      } catch (enrollError) {
        let errorDetails = `❌ Критическая ошибка Enroll: `;
        
        if (enrollError instanceof Error) {
          errorDetails += enrollError.message;
          if ('status' in enrollError) {
            errorDetails += `\n🔢 HTTP Status: ${(enrollError as Error & { status: number }).status}`;
          }
        } else {
          errorDetails += String(enrollError);
        }
        
        if (enrollError instanceof Error && 'status' in enrollError && (enrollError as Error & { status: number }).status === 422) {
          errorDetails += '\n\n🔧 Рекомендации для 422:\n';
          errorDetails += '  1. Проверьте настройки MFA в Dashboard\n';
          errorDetails += '  2. Убедитесь что TOTP включен\n';
          errorDetails += '  3. Проверьте лимиты факторов на пользователя\n';
          errorDetails += '  4. Возможно, нужно подождать применения настроек';
        }
        
        setTestResult(prev => prev + '\n\n' + errorDetails);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setTestResult(`❌ Общая ошибка: ${errorMessage}`);
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Тестирование 2FA
          </h1>
          <p className="text-gray-400">
            Диагностика и настройка двухфакторной аутентификации
          </p>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <Button
            onClick={() => setMode('diagnostic')}
            className={`${mode === 'diagnostic' ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700`}
          >
            🔧 Диагностика
          </Button>
          <Button
            onClick={() => setMode('setup')}
            className={`${mode === 'setup' ? 'bg-green-600' : 'bg-gray-600'} hover:bg-green-700`}
          >
            ⚙️ Настройка 2FA
          </Button>
          <Button
            onClick={runDetailedTest}
            disabled={isTestRunning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isTestRunning ? '🔄 Тестирование...' : '🧪 Детальный тест'}
          </Button>
          <Button
            onClick={cleanupProblematicFactors}
            disabled={isCleaningUp}
            className="bg-red-600 hover:bg-red-700"
          >
            {isCleaningUp ? '🧹 Очистка...' : '🗑️ Очистить проблемные факторы'}
          </Button>
        </div>

        {/* Результат детального теста */}
        {testResult && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-purple-500">
            <h3 className="text-purple-200 font-medium mb-2">🧪 Результат детального теста:</h3>
            <pre className="text-sm text-purple-100 whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        {mode === 'diagnostic' ? (
          <Setup2FADiagnostic />
        ) : (
          <Setup2FA onSetupComplete={() => setMode('diagnostic')} />
        )}
      </div>
    </div>
  );
} 
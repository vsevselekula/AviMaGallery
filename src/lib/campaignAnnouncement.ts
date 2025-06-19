import { Campaign } from './types';

/**
 * Генерирует анонс кампании в текстовом формате для мессенджера
 */
export function generateCampaignAnnouncement(campaign: Campaign): string {
  const sections: string[] = [];

  // 1. Заголовок с названием кампании
  sections.push(`### 🎯 **${campaign.campaign_name}**`);
  sections.push('');

  // 2. Основная информация (тип, вертикаль, статус)
  if (campaign.campaign_type) {
    sections.push(`**Тип кампании:** ${campaign.campaign_type}`);
  }
  
  if (campaign.campaign_vertical) {
    sections.push(`**Вертикаль:** ${campaign.campaign_vertical}`);
  }

  if (campaign.status) {
    const statusEmoji = {
      'active': '🟢',
      'planned': '🟡', 
      'completed': '✅'
    }[campaign.status] || '⚪';
    sections.push(`**Статус:** ${statusEmoji} ${getStatusText(campaign.status)}`);
  }
  sections.push('');

  // 3. Период проведения
  if (campaign.flight_period?.start_date && campaign.flight_period?.end_date) {
    const startDate = formatDate(campaign.flight_period.start_date);
    const endDate = formatDate(campaign.flight_period.end_date);
    sections.push(`**📅 Период проведения:** ${startDate} - ${endDate}`);
    sections.push('');
  }

  // 4. Ключевое сообщение (самое важное!)
  if (campaign.key_message) {
    sections.push(`**💬 Ключевое сообщение:**`);
    sections.push(campaign.key_message);
    sections.push('');
  }

  // 5. Слоган (если есть)
  if (campaign.slogan) {
    sections.push(`**✨ Слоган:** *${campaign.slogan}*`);
    sections.push('');
  }

  // 6. Описание
  if (campaign.description) {
    sections.push(`**📝 Описание:**`);
    sections.push(campaign.description);
    sections.push('');
  }

  // 7. Целевая аудитория
  if (campaign.audience) {
    sections.push(`**👥 Аудитория:** ${campaign.audience}`);
    sections.push('');
  }

  // 8. География
  if (campaign.geo) {
    sections.push(`**🌍 География:** ${campaign.geo}`);
    sections.push('');
  }

  // 9. Цели кампании
  if (campaign.objectives && campaign.objectives.length > 0) {
    sections.push(`**🎯 Цели:**`);
    campaign.objectives.forEach(objective => {
      sections.push(`• ${objective}`);
    });
    sections.push('');
  }

  // 10. Каналы размещения
  if (campaign.channels && campaign.channels.length > 0) {
    sections.push(`**📢 Каналы:**`);
    campaign.channels.forEach(channel => {
      sections.push(`• ${channel}`);
    });
    sections.push('');
  }

  // 11. Таргеты (если есть)
  if (campaign.targets && campaign.targets.length > 0) {
    sections.push(`**🎯 Таргеты:**`);
    campaign.targets.forEach(target => {
      sections.push(`• ${target}`);
    });
    sections.push('');
  }

  // 12. Ссылки на материалы
  if (campaign.links && Array.isArray(campaign.links) && campaign.links.length > 0) {
    sections.push(`**🔗 Ссылки на материалы:**`);
    campaign.links.forEach(link => {
      if (link.label && link.url) {
        sections.push(`• **${link.label}:** [${link.url}](${link.url})`);
      }
    });
    sections.push('');
  }

  // 13. Тестирование
  if (campaign.pre_tests || campaign.post_tests) {
    sections.push(`**🧪 Тестирование:**`);
    
    if (campaign.pre_tests) {
      sections.push(`**Pre-тесты:**`);
      sections.push(formatTestData(campaign.pre_tests));
      sections.push('');
    }
    
    if (campaign.post_tests) {
      sections.push(`**Post-тесты:**`);
      sections.push(formatTestData(campaign.post_tests));
      sections.push('');
    }
  }

  return sections.join('\n');
}

/**
 * Форматирует дату в читаемый формат
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Возвращает текстовое представление статуса
 */
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Активна',
    'planned': 'Запланирована',
    'completed': 'Завершена'
  };
  return statusMap[status] || status;
}

/**
 * Форматирует данные тестов для анонса
 */
function formatTestData(testData: unknown): string {
  if (!testData) return 'Нет данных';

  // Если это строка - просто возвращаем
  if (typeof testData === 'string') {
    return testData;
  }

  // Проверяем комбинированный формат {text?: string, links?: TestLink[]}
  if (typeof testData === 'object' && testData !== null && !Array.isArray(testData)) {
    const data = testData as {
      text?: string;
      links?: Array<{ label: string; url: string }>;
    };

    if (data.text !== undefined || data.links !== undefined) {
      const parts: string[] = [];
      
      if (data.text && data.text.trim()) {
        parts.push(data.text.trim());
      }
      
      if (data.links && data.links.length > 0) {
        data.links.forEach(link => {
          if (link.label && link.url) {
            parts.push(`[${link.label}](${link.url})`);
          }
        });
      }
      
      return parts.join('\n');
    }
  }

  // Если это массив ссылок (формат TestLink[])
  if (Array.isArray(testData)) {
    const parts: string[] = [];
    
    testData.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        const link = item as { label?: string; url?: string };
        
                 // Проверяем, является ли это объектом ссылки
         if (link.label && link.url) {
           parts.push(`[${link.label}](${link.url})`);
         } else {
          // Если это не ссылка, форматируем как сложный объект
          parts.push(formatComplexObject(item as Record<string, unknown>, index + 1));
        }
      } else {
        parts.push(`• ${String(item)}`);
      }
    });

    return parts.join('\n');
  }

  // Если это сложный объект - форматируем как читаемый текст
  if (typeof testData === 'object' && testData !== null) {
    return formatComplexObject(testData as Record<string, unknown>);
  }

  return String(testData);
}

/**
 * Форматирует сложный объект в читаемый текст
 */
function formatComplexObject(obj: Record<string, unknown>, index?: number): string {
  const parts: string[] = [];
  
  if (index) {
    parts.push(`**Тест ${index}:**`);
  }

  Object.entries(obj).forEach(([key, value]) => {
    // Переводим ключи на русский и делаем их читаемыми
    const readableKey = translateKey(key);
    
    if (value === null || value === undefined) {
      return; // Пропускаем пустые значения
    }

         if (typeof value === 'string') {
       if (value.startsWith('http')) {
         // Это ссылка
         parts.push(`• **${readableKey}:** [${value}](${value})`);
       } else {
         // Обычный текст
         parts.push(`• **${readableKey}:** ${value}`);
       }
    } else if (typeof value === 'number') {
      parts.push(`• **${readableKey}:** ${value}`);
    } else if (typeof value === 'boolean') {
      parts.push(`• **${readableKey}:** ${value ? 'Да' : 'Нет'}`);
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        parts.push(`• **${readableKey}:**`);
        value.forEach((item) => {
          if (typeof item === 'string') {
            parts.push(`  - ${item}`);
          } else if (typeof item === 'object' && item !== null) {
            parts.push(`  - ${JSON.stringify(item)}`);
          } else {
            parts.push(`  - ${String(item)}`);
          }
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      // Вложенный объект
      parts.push(`• **${readableKey}:**`);
      const nestedText = formatComplexObject(value as Record<string, unknown>);
      nestedText.split('\n').forEach(line => {
        if (line.trim()) {
          parts.push(`  ${line}`);
        }
      });
    } else {
      parts.push(`• **${readableKey}:** ${String(value)}`);
    }
  });

  return parts.join('\n');
}

/**
 * Переводит ключи объекта на русский язык
 */
function translateKey(key: string): string {
  const translations: Record<string, string> = {
    'title': 'Название',
    'name': 'Название',
    'label': 'Метка',
    'description': 'Описание',
    'url': 'Ссылка',
    'link': 'Ссылка',
    'href': 'Ссылка',
    'type': 'Тип',
    'status': 'Статус',
    'date': 'Дата',
    'created_at': 'Создано',
    'updated_at': 'Обновлено',
    'start_date': 'Дата начала',
    'end_date': 'Дата окончания',
    'results': 'Результаты',
    'score': 'Оценка',
    'rating': 'Рейтинг',
    'feedback': 'Отзыв',
    'comment': 'Комментарий',
    'notes': 'Заметки',
    'conclusion': 'Заключение',
    'recommendation': 'Рекомендация',
    'methodology': 'Методология',
    'sample_size': 'Размер выборки',
    'target_audience': 'Целевая аудитория',
    'metrics': 'Метрики',
    'kpi': 'KPI',
    'performance': 'Производительность',
    'effectiveness': 'Эффективность',
    'awareness': 'Узнаваемость',
    'recall': 'Запоминаемость',
    'brand_lift': 'Прирост бренда',
    'purchase_intent': 'Намерение покупки',
    'attitude': 'Отношение',
    'perception': 'Восприятие',
  };

  // Сначала проверяем точное совпадение
  if (translations[key.toLowerCase()]) {
    return translations[key.toLowerCase()];
  }

  // Затем ищем частичные совпадения
  for (const [eng, rus] of Object.entries(translations)) {
    if (key.toLowerCase().includes(eng)) {
      return rus;
    }
  }

  // Если перевода нет, делаем ключ читаемым
  return key
    .replace(/([A-Z])/g, ' $1') // Разделяем camelCase
    .replace(/[_-]/g, ' ') // Заменяем подчеркивания и дефисы на пробелы
    .replace(/^\w/, c => c.toUpperCase()) // Первая буква заглавная
    .trim();
} 
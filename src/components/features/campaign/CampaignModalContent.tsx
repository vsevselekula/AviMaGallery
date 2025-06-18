import React from 'react';
import { Campaign } from '@/lib/types';
import { CampaignSection } from './CampaignSection';
import { CampaignTag } from './CampaignTag';

interface CampaignModalContentProps {
  campaign: Campaign;
}

// Helper для рендера ссылок
const renderLinks = (
  links:
    | { label?: string; url?: string }[]
    | Record<string, string>
    | string
    | null
    | undefined
) => {
  if (!links) return <span className="text-gray-400">Нет данных</span>;
  
  if (Array.isArray(links)) {
    return (
      <ul className="list-disc ml-6">
        {links.map((l, i) => (
          <li key={i}>
            {typeof l === 'object' &&
            l !== null &&
            'label' in l &&
            'url' in l &&
            l.label &&
            l.url ? (
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {l.label}
              </a>
            ) : typeof l === 'object' && l !== null && 'url' in l && l.url ? (
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {l.url}
              </a>
            ) : typeof l === 'object' &&
              l !== null &&
              'label' in l &&
              l.label ? (
              l.label
            ) : (
              String(l)
            )}
          </li>
        ))}
      </ul>
    );
  }
  
  if (typeof links === 'object' && links !== null) {
    return (
      <ul className="list-disc ml-6">
        {Object.entries(links).map(([k, v]) => (
          <li key={k}>
            {typeof v === 'string' && v.startsWith('http') ? (
              <a
                href={v}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {k}
              </a>
            ) : typeof v === 'string' ? (
              `${k}: ${v}`
            ) : (
              `${k}: ${JSON.stringify(v)}`
            )}
          </li>
        ))}
      </ul>
    );
  }
  
  return <span>{String(links)}</span>;
};

// Специальная функция для красивого отображения тестов
const renderTestData = (testData: unknown): React.ReactNode => {
  if (!testData) return <span className="text-gray-400">Нет данных</span>;

  // Если это строка - просто отображаем
  if (typeof testData === 'string') {
    return <div className="text-white whitespace-pre-wrap">{testData}</div>;
  }

  // Если это массив тестов
  if (Array.isArray(testData)) {
    return (
      <div className="space-y-4">
        {testData.map((test, index) => {
          if (typeof test === 'object' && test !== null) {
            const testObj = test as Record<string, unknown>;
            
            // Проверяем, является ли это простым объектом с названием и ссылкой
            const keys = Object.keys(testObj);
            
            // Проверяем различные паттерны простых ссылок
            const hasUrl = keys.some(key => 
              key.toLowerCase().includes('url') || 
              key.toLowerCase().includes('link') || 
              key.toLowerCase().includes('href') ||
              key.toLowerCase().includes('ссылка')
            );
            
            const hasLabel = keys.some(key => 
              key.toLowerCase().includes('label') || 
              key.toLowerCase().includes('name') || 
              key.toLowerCase().includes('title') ||
              key.toLowerCase().includes('название') ||
              key.toLowerCase().includes('содержание')
            );
            
            // Также проверяем, если есть только одно поле с URL
            const singleUrlField = keys.length === 1 && keys.some(key => {
              const value = testObj[key];
              return typeof value === 'string' && (
                value.startsWith('http') || 
                value.includes('drive.google.com') ||
                value.includes('cf.avito.ru')
              );
            });
            
            const isSimpleLink = (keys.length <= 3 && hasUrl && hasLabel) || singleUrlField;
            
            if (isSimpleLink) {
              if (singleUrlField) {
                // Если это одно поле с URL - используем ключ как название
                const key = keys[0];
                const url = testObj[key] as string;
                
                return (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors font-medium"
                    >
                      🔗 {key}
                    </a>
                  </div>
                );
              } else {
                // Находим ключи для URL и названия
                const urlKey = keys.find(key => 
                  key.toLowerCase().includes('url') || 
                  key.toLowerCase().includes('link') || 
                  key.toLowerCase().includes('href') ||
                  key.toLowerCase().includes('ссылка')
                );
                const labelKey = keys.find(key => 
                  key.toLowerCase().includes('label') || 
                  key.toLowerCase().includes('name') || 
                  key.toLowerCase().includes('title') ||
                  key.toLowerCase().includes('название') ||
                  key.toLowerCase().includes('содержание')
                );
                
                const url = urlKey ? testObj[urlKey] : null;
                const label = labelKey ? testObj[labelKey] : null;
                
                if (typeof url === 'string' && typeof label === 'string') {
                  return (
                    <div key={index} className="bg-gray-700 rounded-lg p-3">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors font-medium"
                      >
                        🔗 {label}
                      </a>
                    </div>
                  );
                }
              }
            }
            
            // Если это сложный объект с reports и summary - используем полную карточку
            if (testObj.reports || testObj.summary) {
              return (
                <div key={index} className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Тест {index + 1}
                    </span>
                  </div>
                  
                  {(() => {
                    if (!testObj.reports || !Array.isArray(testObj.reports) || testObj.reports.length === 0) {
                      return null;
                    }
                    
                    return (
                      <div className="mb-3">
                        <h6 className="text-blue-300 text-sm font-semibold mb-2">📊 Отчеты:</h6>
                        <div className="space-y-1">
                          {testObj.reports.map((report, reportIndex: number) => {
                            const reportObj = report as Record<string, unknown>;
                            return (
                              <div key={reportIndex}>
                                {typeof reportObj.url === 'string' && typeof reportObj.label === 'string' ? (
                                  <a
                                    href={reportObj.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
                                  >
                                    🔗 {reportObj.label}
                                  </a>
                                ) : (
                                  <span className="text-gray-300 text-sm">{JSON.stringify(report)}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {(() => {
                    if (!testObj.summary) return null;
                    
                    return (
                      <div>
                        <h6 className="text-green-300 text-sm font-semibold mb-2">📝 Результаты:</h6>
                        <div className="text-white text-sm leading-relaxed bg-gray-800 rounded p-3">
                          {String(testObj.summary)}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {Object.entries(testObj).map(([key, value]) => {
                    if (key === 'reports' || key === 'summary') return null;
                    
                    return (
                      <div key={key} className="mt-3">
                        <h6 className="text-yellow-300 text-sm font-semibold mb-1">
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </h6>
                        <div className="text-white text-sm">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }
            
            // Для других объектов - простое отображение
            return (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <div className="text-white text-sm">
                  {Object.entries(testObj).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="text-gray-300">{key}:</span>{' '}
                      <span className="text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          
          return (
            <div key={index} className="bg-gray-700 rounded-lg p-3">
              <div className="text-white text-sm">{String(test)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // Если это объект - красиво форматируем (старая логика)
  if (typeof testData === 'object' && testData !== null) {
    try {
      const data = testData as Record<string, unknown>;
      
      return (
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-gray-700 rounded-lg p-3">
              <h5 className="text-sm font-semibold text-blue-300 mb-2">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h5>
              
              {typeof value === 'string' ? (
                <div className="text-white text-sm leading-relaxed">{value}</div>
              ) : typeof value === 'object' && value !== null ? (
                <div className="space-y-1">
                  {Object.entries(value as Record<string, unknown>).map(([subKey, subValue]) => (
                    <div key={subKey} className="flex justify-between items-start gap-2">
                      <span className="text-gray-300 text-sm flex-shrink-0">{subKey}:</span>
                      <span className="text-white text-sm font-medium text-right">
                        {typeof subValue === 'string' ? subValue : String(subValue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white text-sm">{String(value)}</div>
              )}
            </div>
          ))}
        </div>
      );
    } catch {
      // Если не удалось распарсить - показываем как есть
      return <div className="text-white text-sm whitespace-pre-wrap">{JSON.stringify(testData, null, 2)}</div>;
    }
  }

  return <div className="text-white text-sm">{String(testData)}</div>;
};

export function CampaignModalContent({ campaign }: CampaignModalContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Периоды и аудитория */}
      <CampaignSection title="Периоды и аудитория" icon={<span>📅</span>}>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">География</h4>
            <p className="text-white">{campaign.geo || 'Не указана'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Аудитория</h4>
            <p className="text-white">{campaign.audience || 'Не указана'}</p>
          </div>
        </div>
      </CampaignSection>

      {/* Таргеты */}
      <CampaignSection title="" icon={<span>🎯</span>}>
        <div className="space-y-4">
          {Array.isArray(campaign.targets) && campaign.targets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {campaign.targets.map((target, i) => (
                <CampaignTag key={i} color="purple">{target}</CampaignTag>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Не указаны</p>
          )}
        </div>
      </CampaignSection>

      {/* Каналы */}
      <CampaignSection title="Каналы и медиа" icon={<span>📡</span>}>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Каналы</h4>
            {Array.isArray(campaign.channels) && campaign.channels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {campaign.channels.map((channel, i) => (
                  <CampaignTag key={i} color="blue">{channel}</CampaignTag>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Не указаны</p>
            )}
          </div>
        </div>
      </CampaignSection>

      {/* Ссылки */}
      <CampaignSection title="Ссылки" icon={<span>🔗</span>}>
        {renderLinks(campaign.links)}
      </CampaignSection>

      {/* Тесты */}
      <CampaignSection title="Тесты" icon={<span>🧪</span>} className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Пре-тесты</h4>
            {renderTestData(campaign.pre_tests)}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Пост-тесты</h4>
            {renderTestData(campaign.post_tests)}
          </div>
        </div>
      </CampaignSection>
    </div>
  );
} 
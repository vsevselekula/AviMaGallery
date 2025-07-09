import React, { useState, useEffect } from 'react';

interface TestLink {
  label: string;
  url: string;
}

interface TestData {
  text?: string;
  links?: TestLink[];
}

interface TestDataEditorProps {
  value: unknown;
  onChange: (value: unknown) => void;
  label: string;
  placeholder?: string;
}

export function TestDataEditor({
  value,
  onChange,
  label,
  placeholder = 'Введите текст и/или добавьте ссылки',
}: TestDataEditorProps) {
  const [textValue, setTextValue] = useState('');
  const [linksValue, setLinksValue] = useState<TestLink[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Инициализируем данные при загрузке
  useEffect(() => {
    // Если мы сейчас обновляем состояние изнутри компонента, не сбрасываем его
    if (isUpdating) {
      setIsUpdating(false);
      return;
    }

    if (!value) {
      setTextValue('');
      setLinksValue([]);
      return;
    }

    if (typeof value === 'string') {
      setTextValue(value);
      setLinksValue([]);
    } else if (Array.isArray(value)) {
      // Проверяем, является ли это массивом ссылок
      const isLinksArray = value.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          'label' in item &&
          'url' in item
      );

      if (isLinksArray) {
        setLinksValue(value as TestLink[]);
        setTextValue('');
      } else {
        // Если это сложный массив - отображаем как текст
        setTextValue(JSON.stringify(value, null, 2));
        setLinksValue([]);
      }
    } else if (typeof value === 'object' && value !== null) {
      // Проверяем, если это наш комбинированный формат
      const testData = value as TestData;
      if (testData.text !== undefined || testData.links !== undefined) {
        setTextValue(testData.text || '');
        setLinksValue(testData.links || []);
      } else {
        // Если это другой объект - отображаем как текст
        setTextValue(JSON.stringify(value, null, 2));
        setLinksValue([]);
      }
    }
  }, [value, isUpdating]);

  const updateValue = (newText: string, newLinks: TestLink[]) => {
    // Не фильтруем пустые ссылки при редактировании - пользователь должен иметь возможность их заполнить
    const hasText = newText.trim();
    const hasLinks = newLinks.length > 0;

    if (!hasText && !hasLinks) {
      onChange(null);
    } else if (hasText && !hasLinks) {
      onChange(newText);
    } else if (!hasText && hasLinks) {
      onChange(newLinks);
    } else {
      // Комбинированный режим
      onChange({
        text: newText,
        links: newLinks,
      });
    }
  };

  const handleTextChange = (newText: string) => {
    setTextValue(newText);
    updateValue(newText, linksValue);
  };

  const handleLinksChange = (newLinks: TestLink[]) => {
    setIsUpdating(true); // Отмечаем, что мы обновляем изнутри
    setLinksValue(newLinks);
    updateValue(textValue, newLinks);
  };

  const addLink = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const newLinks = [...linksValue, { label: '', url: '' }];
    handleLinksChange(newLinks);
  };

  const removeLink = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    const newLinks = linksValue.filter((_, i) => i !== index);
    handleLinksChange(newLinks);
  };

  const updateLink = (index: number, field: keyof TestLink, value: string) => {
    const newLinks = [...linksValue];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleLinksChange(newLinks);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      {/* Текстовое поле */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">
          📝 Текстовое описание
        </label>
        <textarea
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-vertical"
        />
      </div>

      {/* Ссылки */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">
          🔗 Ссылки на отчеты
        </label>
        <div className="space-y-3">
          {linksValue.length === 0 && (
            <div className="text-center py-3 text-gray-500 text-sm border border-dashed border-gray-600 rounded-lg">
              Нет ссылок. Нажмите "Добавить ссылку" чтобы создать первую.
            </div>
          )}

          {linksValue.map((link, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">
                  Ссылка {index + 1}
                </span>
                <button
                  type="button"
                  onClick={(e) => removeLink(index, e)}
                  className="text-red-400 hover:text-red-300 text-xs transition-colors"
                >
                  ✕ Удалить
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Название ссылки"
                  value={link.label}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLink}
            className="w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors text-sm font-medium"
          >
            + Добавить ссылку
          </button>
        </div>
      </div>
    </div>
  );
}

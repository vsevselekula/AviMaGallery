import React, { useState, useEffect } from 'react';

interface CampaignLink {
  label: string;
  url: string;
}

interface LinksEditorProps {
  value: CampaignLink[] | unknown;
  onChange: (value: CampaignLink[]) => void;
  label: string;
}

export function LinksEditor({ value, onChange, label }: LinksEditorProps) {
  const [linksValue, setLinksValue] = useState<CampaignLink[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Инициализируем данные при загрузке
  useEffect(() => {
    // Если мы сейчас обновляем состояние изнутри компонента, не сбрасываем его
    if (isUpdating) {
      setIsUpdating(false);
      return;
    }

    if (!value) {
      setLinksValue([]);
      return;
    }

    if (Array.isArray(value)) {
      // Проверяем, является ли это массивом ссылок
      const isLinksArray = value.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          'label' in item &&
          'url' in item
      );

      if (isLinksArray) {
        setLinksValue(value as CampaignLink[]);
      } else {
        // Если это не массив ссылок - создаем пустой массив
        setLinksValue([]);
      }
    } else {
      // Если это не массив - создаем пустой массив
      setLinksValue([]);
    }
  }, [value, isUpdating]);

  const updateValue = (newLinks: CampaignLink[]) => {
    // Не фильтруем новые пустые ссылки - пользователь должен иметь возможность их заполнить
    // Фильтруем только при сохранении формы, а не при каждом изменении
    onChange(newLinks);
  };

  const handleLinksChange = (newLinks: CampaignLink[]) => {
    setIsUpdating(true); // Отмечаем, что мы обновляем изнутри
    setLinksValue(newLinks);
    updateValue(newLinks);
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

  const updateLink = (
    index: number,
    field: keyof CampaignLink,
    value: string
  ) => {
    const newLinks = [...linksValue];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleLinksChange(newLinks);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      {/* Ссылки */}
      <div>
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

# Система бейджей

Этот документ описывает унифицированную систему бейджей для отображения информации о кампаниях.

## Компоненты

### Badge (базовый компонент)

Базовый компонент для всех бейджей с поддержкой различных вариантов и размеров.

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success" size="sm">
  Активная
</Badge>;
```

**Пропы:**

- `variant`: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `className`: дополнительные CSS классы
- `style`: инлайн стили

### VerticalBadge

Специализированный бейдж для отображения вертикалей кампаний с правильными цветами.

```tsx
import { VerticalBadge } from '@/components/ui/CampaignBadges';

<VerticalBadge vertical="Авито" size="md" />;
```

**Особенности:**

- Автоматически применяет правильные цвета из `getVerticalColorClass()`
- Для вертикали "Авито" использует черный текст, для остальных - белый

### CampaignTypeBadge

Бейдж для типов кампаний с прозрачным фоном и белой границей.

```tsx
import { CampaignTypeBadge } from '@/components/ui/CampaignBadges';

<CampaignTypeBadge type="Медийная реклама" size="sm" />;
```

### StatusBadge

Бейдж для статуса кампаний с автоматическим выбором цвета и текста.

```tsx
import { StatusBadge } from '@/components/ui/CampaignBadges';

<StatusBadge status="active" size="sm" />;
```

**Статусы:**

- `active` → "Активная" (зеленый)
- `completed` → "Завершена" (серый)
- `planned` → "Запланирована" (синий)

### GenericBadge

Универсальный бейдж для целей, каналов, задач и других элементов.

```tsx
import { GenericBadge } from '@/components/ui/CampaignBadges';

<GenericBadge color="blue">Цель кампании</GenericBadge>
<GenericBadge color="green">Канал</GenericBadge>
<GenericBadge color="purple">Задача</GenericBadge>
```

**Цвета:**

- `blue` - для целей/objectives
- `green` - для каналов/channels
- `purple` - для задач/targets
- `yellow` - для предупреждений
- `red` - для ошибок

### CampaignBadgeGroup

Группа бейджей для отображения вертикали и типа кампании вместе.

```tsx
import { CampaignBadgeGroup } from '@/components/ui/CampaignBadges';

<CampaignBadgeGroup
  vertical="Авито"
  type="Медийная реклама"
  size="sm"
  showType={true}
/>;
```

## Использование

### В списке кампаний (CampaignCard)

```tsx
<CampaignBadgeGroup
  vertical={campaign.campaign_vertical}
  type={campaign.campaign_type}
  size="sm"
/>
```

### В модальном окне кампании (CampaignModal)

```tsx
<VerticalBadge vertical={campaign.campaign_vertical} />
<StatusBadge status={campaign.status} size="sm" />

{/* Для целей */}
{campaign.objectives?.map((objective, index) => (
  <GenericBadge key={index} color="blue">
    {objective}
  </GenericBadge>
))}

{/* Для каналов */}
{campaign.channels?.map((channel, index) => (
  <GenericBadge key={index} color="green">
    {channel}
  </GenericBadge>
))}
```

### В героическом баннере (HeroBanner)

```tsx
<CampaignBadgeGroup
  vertical={heroCampaign.campaign_vertical}
  type={heroCampaign.campaign_type}
  className="flex-wrap max-w-sm"
/>
```

### В фильтрах (CampaignFilters)

```tsx
{
  selectedVerticals.map((vertical) => (
    <GenericBadge
      key={vertical}
      color="blue"
      size="sm"
      className="inline-flex items-center"
    >
      {vertical}
      <button onClick={() => onToggleVertical(vertical)}>×</button>
    </GenericBadge>
  ));
}
```

## Преимущества системы

1. **Единообразие**: все бейджи выглядят одинаково во всем приложении
2. **Переиспользование**: один компонент для множества случаев использования
3. **Типобезопасность**: TypeScript типы для всех пропов
4. **Гибкость**: поддержка кастомных стилей через className и style
5. **Консистентность цветов**: автоматическое применение правильных цветов для вертикалей

## Миграция

При добавлении новых мест с бейджами:

1. **НЕ создавайте** новые `<span>` элементы с инлайн стилями
2. **Используйте** подходящий компонент из системы бейджей
3. **Для вертикалей** → `VerticalBadge`
4. **Для типов кампаний** → `CampaignTypeBadge`
5. **Для статусов** → `StatusBadge`
6. **Для остального** → `GenericBadge`
7. **Для групп** → `CampaignBadgeGroup`

Это обеспечит консистентность дизайна и упростит поддержку кода.

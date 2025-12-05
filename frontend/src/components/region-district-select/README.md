# RegionDistrictSelect Component

Глобальная компонента для выбора региона и района с интеграцией к backend API.

## Использование

### С React Hook Form

```tsx
import RegionDistrictSelect from 'src/components/region-district-select';

// В вашем компоненте формы
<RegionDistrictSelect
  regionFieldName="geoTarget.region"
  districtFieldName="geoTarget.district"
  regionLabel="Регион"
  districtLabel="Район / Город"
  onRegionChange={(regionId, regionOption) => {
    // Обработка изменения региона
  }}
  onDistrictChange={(districtId, districtOption) => {
    // Обработка изменения района
  }}
/>
```

### Standalone версия (без React Hook Form)

```tsx
import { RegionDistrictSelectStandalone } from 'src/components/region-district-select';

// В вашем компоненте
<RegionDistrictSelectStandalone
  regionValue={regionId}
  districtValue={districtId}
  onRegionChange={(regionId) => setRegionId(regionId)}
  onDistrictChange={(districtId) => setDistrictId(districtId)}
  regionLabel="Выберите регион"
  districtLabel="Выберите район"
/>
```

## Props

### RegionDistrictSelect (React Hook Form версия)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `regionFieldName` | `string` | `'region'` | Имя поля для региона в форме |
| `districtFieldName` | `string` | `'district'` | Имя поля для района в форме |
| `regionLabel` | `string` | `'Регион'` | Лейбл для поля региона |
| `districtLabel` | `string` | `'Район / Город'` | Лейбл для поля района |
| `regionPlaceholder` | `string` | `'Выберите регион'` | Placeholder для поля региона |
| `districtPlaceholder` | `string` | `'Выберите район'` | Placeholder для поля района |
| `size` | `'small' \| 'medium'` | `'medium'` | Размер полей |
| `disabled` | `boolean` | `false` | Отключить поля |
| `fullWidth` | `boolean` | `false` | Отображать только в одну колонку |
| `onRegionChange` | `function` | - | Колбэк при изменении региона |
| `onDistrictChange` | `function` | - | Колбэк при изменении района |

### RegionDistrictSelectStandalone

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `regionValue` | `number \| null` | - | Значение региона |
| `districtValue` | `number \| null` | - | Значение района |
| `onRegionChange` | `function` | - | Колбэк при изменении региона |
| `onDistrictChange` | `function` | - | Колбэк при изменении района |
| `regionLabel` | `string` | `'Регион'` | Лейбл для поля региона |
| `districtLabel` | `string` | `'Район / Город'` | Лейбл для поля района |
| `regionPlaceholder` | `string` | `'Выберите регион'` | Placeholder для поля региона |
| `districtPlaceholder` | `string` | `'Выберите район'` | Placeholder для поля района |
| `size` | `'small' \| 'medium'` | `'medium'` | Размер полей |
| `disabled` | `boolean` | `false` | Отключить поля |
| `fullWidth` | `boolean` | `false` | Отображать только в одну колонку |
| `regionError` | `string` | - | Ошибка для поля региона |
| `districtError` | `string` | - | Ошибка для поля района |

## Особенности

- **Автоматическая загрузка данных** из backend API
- **Зависимость районов от региона** - при смене региона район автоматически сбрасывается
- **Loading состояния** во время загрузки данных
- **Валидация** через React Hook Form (для основной версии)
- **Типобезопасность** с TypeScript

## API Endpoints

Компонента использует следующие endpoints:
- `GET /api/v1/main/regions/` - получение списка регионов
- `GET /api/v1/main/regions/{id}/districts/` - получение районов по региону

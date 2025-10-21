import type { PlaceCategory } from '../types/place';

export const PLACE_CATEGORIES: PlaceCategory[] = [
  {
    id: 'restaurant',
    label: 'Nhà hàng',
    icon: '🍜',
    types: ['restaurant'],
  },
  {
    id: 'cafe',
    label: 'Cà phê',
    icon: '☕',
    types: ['cafe'],
  },
  {
    id: 'bar',
    label: 'Bar',
    icon: '🍺',
    types: ['bar'],
  },
  {
    id: 'fast_food',
    label: 'Ăn vặt',
    icon: '🍕',
    types: ['meal_takeaway', 'fast_food'],
  },
  {
    id: 'bakery',
    label: 'Bánh ngọt',
    icon: '🥐',
    types: ['bakery'],
  },
  {
    id: 'food',
    label: 'Ăn uống',
    icon: '🍴',
    types: ['food'],
  },
];

export const RADIUS_OPTIONS = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
];

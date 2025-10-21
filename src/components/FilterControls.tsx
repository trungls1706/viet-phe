import type { SearchFilters } from '../types/place';
import { PLACE_CATEGORIES, RADIUS_OPTIONS } from '../constants/categories';

interface FilterControlsProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export function FilterControls({ filters, onFilterChange }: FilterControlsProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại quán
          </label>
          <div className="flex flex-wrap gap-2">
            {PLACE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => onFilterChange({ ...filters, category })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.category.id === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bán kính tìm kiếm
          </label>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange({ ...filters, radius: option.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.radius === option.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

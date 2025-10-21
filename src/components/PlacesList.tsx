import { Star, MapPin, Heart, Clock } from 'lucide-react';
import type { PlaceResult } from '../types/place';
import { storage } from '../utils/storage';
import { useState } from 'react';

interface PlacesListProps {
  places: PlaceResult[];
  onPlaceClick: (place: PlaceResult) => void;
  onFavoriteToggle: () => void;
  getPhotoUrl: (photoRef: string) => string;
}

export function PlacesList({ places, onPlaceClick, onFavoriteToggle, getPhotoUrl }: PlacesListProps) {
  const [favorites, setFavorites] = useState(storage.getFavorites());

  const handleFavoriteToggle = (place: PlaceResult, e: React.MouseEvent) => {
    e.stopPropagation();
    if (storage.isFavorite(place.place_id)) {
      storage.removeFavorite(place.place_id);
    } else {
      storage.addFavorite({
        place_id: place.place_id,
        name: place.name,
      });
    }
    setFavorites(storage.getFavorites());
    onFavoriteToggle();
  };

  const isFavorite = (placeId: string) => {
    return favorites.some(f => f.place_id === placeId);
  };

  const formatDistance = (meters: number = 0) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-2xl max-h-[50vh] overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
        <h2 className="text-lg font-bold text-gray-900">
          Tìm thấy {places.length} địa điểm
        </h2>
      </div>

      <div className="overflow-y-auto flex-1">
        {places.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Không tìm thấy địa điểm nào trong khu vực này</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {places.map((place) => (
              <button
                key={place.place_id}
                onClick={() => onPlaceClick(place)}
                className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex gap-3"
              >
                {place.photos && place.photos.length > 0 ? (
                  <img
                    src={getPhotoUrl(place.photos[0].photo_reference)}
                    alt={place.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {place.name}
                    </h3>
                    <button
                      onClick={(e) => handleFavoriteToggle(place, e)}
                      className="flex-shrink-0 p-1"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite(place.place_id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  {place.vicinity && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {place.vicinity}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-sm">
                    {place.rating && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{place.rating}</span>
                        {place.user_ratings_total && (
                          <span className="text-gray-500">
                            ({place.user_ratings_total})
                          </span>
                        )}
                      </div>
                    )}

                    {place.distance !== undefined && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{formatDistance(place.distance)}</span>
                      </div>
                    )}

                    {place.opening_hours?.open_now !== undefined && (
                      <div className={`flex items-center gap-1 ${
                        place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {place.opening_hours.open_now ? 'Đang mở' : 'Đã đóng'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { X, Star, MapPin, Clock, Phone, Globe, Navigation } from 'lucide-react';
import type { PlaceResult } from '../types/place';

interface PlaceInfoWindowProps {
  place: PlaceResult | null;
  onClose: () => void;
  getPhotoUrl: (photoRef: string) => string;
}

export function PlaceInfoWindow({ place, onClose, getPhotoUrl }: PlaceInfoWindowProps) {
  if (!place) return null;

  const formatDistance = (meters: number = 0) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}&query_place_id=${place.place_id}`;
    window.open(url, '_blank');
  };

  return (
    <div className="absolute inset-0 z-30 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-slide-up">
        <div className="relative">
          {place.photos && place.photos.length > 0 ? (
            <img
              src={getPhotoUrl(place.photos[0].photo_reference)}
              alt={place.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-white opacity-50" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {place.name}
          </h2>

          {place.vicinity && (
            <div className="flex items-start gap-2 text-gray-600 mb-3">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{place.vicinity}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            {place.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg">{place.rating}</span>
                </div>
                {place.user_ratings_total && (
                  <span className="text-sm text-gray-500">
                    ({place.user_ratings_total} đánh giá)
                  </span>
                )}
              </div>
            )}

            {place.distance !== undefined && (
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{formatDistance(place.distance)}</span>
              </div>
            )}
          </div>

          {place.opening_hours?.open_now !== undefined && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${
              place.opening_hours.open_now
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <Clock className="w-4 h-4" />
              {place.opening_hours.open_now ? 'Đang mở cửa' : 'Đã đóng cửa'}
            </div>
          )}

          <button
            onClick={openInGoogleMaps}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            Chỉ đường trên Google Maps
          </button>
        </div>
      </div>
    </div>
  );
}

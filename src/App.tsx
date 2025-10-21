import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { PlacesService } from './services/placesService';
import { FilterControls } from './components/FilterControls';
import { PlacesList } from './components/PlacesList';
import { PlaceInfoWindow } from './components/PlaceInfoWindow';
import type { PlaceResult, SearchFilters, Location } from './types/place';
import { PLACE_CATEGORIES } from './constants/categories';
import { storage } from './utils/storage';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';

function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: PLACE_CATEGORIES.find(c => c.id === storage.getDefaultCategory()) || PLACE_CATEGORIES[0],
    radius: storage.getDefaultRadius(),
  });

  const { isLoaded, loadError, map } = useGoogleMaps(
    mapContainerRef,
    userLocation || { lat: 10.8231, lng: 106.6297 },
    15
  );

  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const placesServiceRef = useRef<PlacesService | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí.');
          setUserLocation({ lat: 10.8231, lng: 106.6297 });
          setLoading(false);
        }
      );
    } else {
      setLocationError('Trình duyệt không hỗ trợ định vị.');
      setUserLocation({ lat: 10.8231, lng: 106.6297 });
    }
  }, []);

  useEffect(() => {
    if (map && userLocation) {
      map.setCenter(userLocation);

      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }

      userMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Vị trí của bạn',
      });
    }
  }, [map, userLocation]);

  useEffect(() => {
    if (map && !placesServiceRef.current) {
      placesServiceRef.current = new PlacesService(map);
    }
  }, [map]);

  useEffect(() => {
    if (map && userLocation && placesServiceRef.current) {
      searchNearbyPlaces();
    }
  }, [map, userLocation, filters]);

  const searchNearbyPlaces = async () => {
    if (!userLocation || !placesServiceRef.current || !map) return;

    setLoading(true);
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    try {
      const results = await placesServiceRef.current.searchNearby(
        userLocation,
        filters.radius,
        filters.category.types
      );

      setPlaces(results);

      results.forEach((place) => {
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map,
          title: place.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="20">
                  ${filters.category.icon}
                </text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(32, 32),
          },
        });

        marker.addListener('click', () => {
          setSelectedPlace(place);
        });

        markersRef.current.push(marker);
      });

      storage.saveDefaultCategory(filters.category.id);
      storage.saveDefaultRadius(filters.radius);
    } catch (error) {
      console.error('Failed to search places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceClick = (place: PlaceResult) => {
    setSelectedPlace(place);
    if (map) {
      map.panTo(place.geometry.location);
      map.setZoom(17);
    }
  };

  const getPhotoUrl = (photoRef: string) => {
    return placesServiceRef.current?.getPhotoUrl(photoRef) || '';
  };

  console.log('userLocation',userLocation)
  console.log('isLoaded',isLoaded)

  if (loadError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải bản đồ</h2>
          <p className="text-gray-600">{loadError.message}</p>
          <p className="text-sm text-gray-500 mt-4">
            Vui lòng kiểm tra API key trong file .env
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded || !userLocation) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải bản đồ...</p>
          {locationError && (
            <p className="text-sm text-amber-600 mt-2">{locationError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0" />

      <FilterControls filters={filters} onFilterChange={setFilters} />

      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 z-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      <PlacesList
        places={places}
        onPlaceClick={handlePlaceClick}
        onFavoriteToggle={() => {}}
        getPhotoUrl={getPhotoUrl}
      />

      <PlaceInfoWindow
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        getPhotoUrl={getPhotoUrl}
      />
    </div>
  );
}

export default App;

import { useEffect, useState, useRef } from 'react';

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
  map: google.maps.Map | null;
}

export function useGoogleMaps(
  containerRef: React.RefObject<HTMLDivElement>,
  center: google.maps.LatLngLiteral,
  zoom: number = 15
): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLoadError(new Error('Google Maps API key is missing'));
      return;
    }

    // Nếu script đã load rồi thì không cần load lại
    if (scriptLoadedRef.current) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      setIsLoaded(true);
      scriptLoadedRef.current = true;
    };

    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);

    return () => {
      delete (window as any).initMap;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || map) return;

    try {
      const newMap = new google.maps.Map(containerRef.current, {
        center,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(newMap);
    } catch (error) {
      setLoadError(error as Error);
    }
  }, [isLoaded, containerRef, center, zoom, map]);

  return { isLoaded, loadError, map };
}

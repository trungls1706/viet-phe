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
  const scriptLoadedRef = useRef(true);

  useEffect(() => {

    console.log(scriptLoadedRef.current)
    console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

    if (!scriptLoadedRef.current || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setLoadError(new Error('Please configure your Google Maps API key'));
      return;
    }

    const handleLoad = () => {
      setIsLoaded(true);
    };

    if (window.google && window.google.maps) {
      handleLoad();
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps'));
    };

    window.addEventListener('google-maps-loaded', handleLoad);
    document.head.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      window.removeEventListener('google-maps-loaded', handleLoad);
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

import type { PlaceResult, Location } from '../types/place';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class PlacesService {
  private service: google.maps.places.PlacesService | null = null;

  constructor(map: google.maps.Map) {
    this.service = new google.maps.places.PlacesService(map);
  }

  async searchNearby(
    location: Location,
    radius: number,
    types: string[]
  ): Promise<PlaceResult[]> {
    if (!this.service) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: types[0],
      };

      this.service!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const placesWithDistance = results.map(place => {
            const placeLocation = place.geometry?.location;
            const distance = placeLocation
              ? calculateDistance(
                  location.lat,
                  location.lng,
                  placeLocation.lat(),
                  placeLocation.lng()
                )
              : 0;

            return {
              place_id: place.place_id!,
              name: place.name!,
              vicinity: place.vicinity,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              geometry: {
                location: {
                  lat: placeLocation!.lat(),
                  lng: placeLocation!.lng(),
                },
              },
              photos: place.photos?.map(photo => ({
                photo_reference: (photo as any).photo_reference || '',
                height: photo.height,
                width: photo.width,
              })),
              opening_hours: place.opening_hours ? {
                open_now: place.opening_hours.open_now,
              } : undefined,
              types: place.types,
              distance,
            } as PlaceResult;
          });

          placesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          resolve(placesWithDistance);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult> {
    if (!this.service) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'website', 'rating', 'photos'],
      };

      this.service!.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }

  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
  }
}

export interface PlaceCategory {
  id: string;
  label: string;
  icon: string;
  types: string[];
}

export interface Location {
  lat: number;
  lng: number;
}

export interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

export interface OpeningHours {
  open_now?: boolean;
  weekday_text?: string[];
}

export interface PlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: Location;
  };
  photos?: PlacePhoto[];
  opening_hours?: OpeningHours;
  types?: string[];
  distance?: number;
}

export interface SearchFilters {
  category: PlaceCategory;
  radius: number;
}

export interface FavoritePlace {
  place_id: string;
  name: string;
  addedAt: number;
}

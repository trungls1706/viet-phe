import type { FavoritePlace } from '../types/place';

const FAVORITES_KEY = 'nearby_places_favorites';
const RADIUS_KEY = 'nearby_places_radius';
const CATEGORY_KEY = 'nearby_places_category';

export const storage = {
  getFavorites(): FavoritePlace[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveFavorites(favorites: FavoritePlace[]): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  },

  addFavorite(place: Omit<FavoritePlace, 'addedAt'>): void {
    const favorites = this.getFavorites();
    if (!favorites.some(f => f.place_id === place.place_id)) {
      favorites.push({ ...place, addedAt: Date.now() });
      this.saveFavorites(favorites);
    }
  },

  removeFavorite(placeId: string): void {
    const favorites = this.getFavorites();
    this.saveFavorites(favorites.filter(f => f.place_id !== placeId));
  },

  isFavorite(placeId: string): boolean {
    return this.getFavorites().some(f => f.place_id === placeId);
  },

  getDefaultRadius(): number {
    try {
      const data = localStorage.getItem(RADIUS_KEY);
      return data ? parseInt(data, 10) : 1000;
    } catch {
      return 1000;
    }
  },

  saveDefaultRadius(radius: number): void {
    try {
      localStorage.setItem(RADIUS_KEY, radius.toString());
    } catch (error) {
      console.error('Failed to save radius:', error);
    }
  },

  getDefaultCategory(): string {
    try {
      return localStorage.getItem(CATEGORY_KEY) || 'restaurant';
    } catch {
      return 'restaurant';
    }
  },

  saveDefaultCategory(categoryId: string): void {
    try {
      localStorage.setItem(CATEGORY_KEY, categoryId);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  },
};

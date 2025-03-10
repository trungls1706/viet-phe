import { User } from './supabase/types';

export const canManageCoffeeShops = (user: User | null): boolean => {
  if (!user) return false;
  return ['owner', 'admin'].includes(user.role);
};

export const canDeleteCoffeeShops = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'owner';
}; 
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CoffeeShop } from '@/lib/supabase/types';
import PhotoDetailClient from './PhotoDetailClient';

export default function PhotoDetailPage({ params }: { params: { id: string } }) {
  const [coffeeShop, setCoffeeShop] = useState<CoffeeShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoffeeShop();
  }, []);

  const fetchCoffeeShop = async () => {
    try {
      const { data, error } = await supabase
        .from('coffee_shops')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setCoffeeShop(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching the coffee shop');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!coffeeShop || error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Coffee Shop Not Found</h1>
          <p className="text-gray-400">The coffee shop you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const mainImage = {
    id: coffeeShop.id,
    url: coffeeShop.images[0] || '/placeholder-coffee.jpg',
    title: coffeeShop.name,
    width: 1200,
    height: 800,
  };

  return (
    <PhotoDetailClient
      image={mainImage}
      coffeeShop={coffeeShop}
      prevImage={null}
      nextImage={null}
      relatedImages={coffeeShop.images.slice(1).map((url, index) => ({
        id: `${coffeeShop.id}-${index + 1}`,
        url,
        title: `${coffeeShop.name} - Image ${index + 1}`,
        width: 800,
        height: 600,
      }))}
    />
  );
}

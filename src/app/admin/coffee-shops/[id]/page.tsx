'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { CoffeeShop } from '@/lib/supabase/types';
import Image from 'next/image';
import Link from 'next/link';

export default function ViewCoffeeShop({ params }: { params: { id: string } }) {
  const router = useRouter();
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this coffee shop?')) return;

    try {
      const { error } = await supabase
        .from('coffee_shops')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
      router.push('/admin/coffee-shops');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the coffee shop');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!coffeeShop) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Coffee Shop Not Found</h1>
            <Link
              href="/admin/coffee-shops"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Coffee Shops
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <Link
                href="/admin/coffee-shops"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Coffee Shops
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{coffeeShop.name}</h1>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/admin/coffee-shops/${params.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Images */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {coffeeShop.images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${coffeeShop.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-base text-gray-900">{coffeeShop.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Rating</dt>
                    <dd className="mt-1 text-base text-gray-900 flex items-center">
                      {coffeeShop.rating}
                      <svg
                        className="h-5 w-5 text-yellow-400 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {coffeeShop.coordinates.latitude}, {coffeeShop.coordinates.longitude}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
                <dl className="space-y-4">
                  {coffeeShop.fb_url && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Facebook</dt>
                      <dd className="mt-1">
                        <a
                          href={coffeeShop.fb_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {coffeeShop.fb_url}
                        </a>
                      </dd>
                    </div>
                  )}
                  {coffeeShop.instagram_url && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Instagram</dt>
                      <dd className="mt-1">
                        <a
                          href={coffeeShop.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {coffeeShop.instagram_url}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: coffeeShop.description }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
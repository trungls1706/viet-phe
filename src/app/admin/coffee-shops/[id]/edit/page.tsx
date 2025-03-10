'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { CoffeeShop } from '@/lib/supabase/types';
import { ImageUploadZone } from '../../../add-coffee-shop/components';
import { Editor } from '@tinymce/tinymce-react';

export default function EditCoffeeShop({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CoffeeShop, 'id' | 'created_at'>>({
    name: '',
    description: '',
    address: '',
    instagram_url: '',
    fb_url: '',
    images: [],
    videos: [],
    rating: 5,
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  });

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
      if (data) {
        const { id, created_at, ...rest } = data;
        setFormData(rest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching the coffee shop');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }
  ) => {
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase
        .from('coffee_shops')
        .update(formData)
        .eq('id', params.id);

      if (error) throw error;

      router.push('/admin/coffee-shops');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the coffee shop');
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow">
        {error && (
          <div className="p-4 bg-red-100 text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex">
          <ImageUploadZone
            images={formData.images}
            onImagesChange={handleImagesChange}
            onMessage={(type, content) => setError(type === 'error' ? content : null)}
          />
          <div className="w-1/2 p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter coffee shop name"
                required
                className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                required
                className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <Editor
                  apiKey="your-tinymce-api-key"
                  value={formData.description}
                  onEditorChange={(content) => {
                    handleInputChange({ name: 'description', value: content });
                  }}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Facebook URL</label>
                <input
                  type="url"
                  name="fb_url"
                  value={formData.fb_url}
                  onChange={handleInputChange}
                  placeholder="Add Facebook link"
                  className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-900 mb-2">Instagram URL</label>
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleInputChange}
                  placeholder="Add Instagram link"
                  className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Rating</label>
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                value={formData.rating}
                onChange={handleInputChange}
                placeholder="Enter rating (1-5)"
                className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Coordinates */}
            <div className="space-y-4">
              <h3 className="block text-base font-medium text-gray-900 mb-2">Coordinates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="coordinates.latitude"
                    value={formData.coordinates.latitude}
                    onChange={handleInputChange}
                    placeholder="Latitude"
                    className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="coordinates.longitude"
                    value={formData.coordinates.longitude}
                    onChange={handleInputChange}
                    placeholder="Longitude"
                    className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-4 px-6 text-white text-lg font-medium rounded-[12px] shadow-lg bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl transform transition-all duration-200"
              >
                Update Coffee Shop
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 
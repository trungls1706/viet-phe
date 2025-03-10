'use client';

import { supabase } from '@/lib/supabase/client';
import type { CoffeeShop } from '@/lib/supabase/types';
import { useState, useMemo } from 'react';
import { ImageUploadZone, CoffeeShopInfoForm } from './components';

type FormData = Omit<CoffeeShop, 'id' | 'created_at'>;

export default function AddCoffeeShop() {
  const [formData, setFormData] = useState<FormData>({
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const isFormValid = useMemo(() => {
    return formData.name.trim() !== '' && 
      formData.address.trim() !== '' && 
      formData.description.trim() !== '' &&
      formData.images.length > 0;
  }, [formData.name, formData.address, formData.description, formData.images]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }
  ) => {
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: FormData) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', content: '' });

    try {
      const { error } = await supabase.from('coffee_shops').insert([formData]);

      if (error) throw error;

      setMessage({
        type: 'success',
        content: 'Quán cafe đã được thêm thành công!',
      });

      // Reset form
      setFormData({
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
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'Có lỗi xảy ra khi thêm quán cafe.',
      });
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow">
        {message.content && (
          <div
            className={`p-4 ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.content}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex">
          <ImageUploadZone
            images={formData.images}
            onImagesChange={handleImagesChange}
            onMessage={(type, content) => setMessage({ type, content })}
          />
          <CoffeeShopInfoForm
            formData={formData}
            onFormDataChange={handleInputChange}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
          />
        </form>
      </div>
    </div>
  );
}

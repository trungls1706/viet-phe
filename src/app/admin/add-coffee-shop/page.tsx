'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CoffeeShop } from '@/lib/supabase/types';

type FormData = Omit<CoffeeShop, 'id' | 'created_at'>;

export default function AddCoffeeShop() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string>('');

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

  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Check Supabase connection when component mounts
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  // Function to check Supabase connection
  const checkSupabaseConnection = async () => {
    try {
      setConnectionStatus('checking');
      // Try to query the coffee_shops table
      const { data, error } = await supabase
        .from('coffee_shops')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      setConnectionStatus('connected');
      setConnectionError('');
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Không thể kết nối đến Supabase');
      console.error('Supabase connection error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: FormData) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addImage = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      setImageUrl('');
    }
  };

  const addVideo = () => {
    if (videoUrl && !formData.videos.includes(videoUrl)) {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, videoUrl]
      }));
      setVideoUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', content: '' });

    try {
      const { error } = await supabase
        .from('coffee_shops')
        .insert([formData]);

      if (error) throw error;

      setMessage({
        type: 'success',
        content: 'Quán cafe đã được thêm thành công!'
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
        content: 'Có lỗi xảy ra khi thêm quán cafe.'
      });
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Connection Status */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Thêm Quán Cafe Mới</h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Trạng thái kết nối:</span>
            {connectionStatus === 'checking' && (
              <span className="flex items-center text-yellow-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang kiểm tra
              </span>
            )}
            {connectionStatus === 'connected' && (
              <span className="flex items-center text-green-600">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Đã kết nối
              </span>
            )}
            {connectionStatus === 'error' && (
              <div className="flex flex-col">
                <span className="flex items-center text-red-600">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Lỗi kết nối
                </span>
                {connectionError && (
                  <span className="text-xs text-red-500">{connectionError}</span>
                )}
              </div>
            )}
            
            <button
              type="button"
              onClick={checkSupabaseConnection}
              className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Kiểm tra lại
            </button>
          </div>
        </div>

        {message.content && (
          <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên quán *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
              <input
                type="url"
                name="fb_url"
                value={formData.fb_url}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              />
            </div>
          </div>

          {/* Ảnh và Video */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Thêm ảnh</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Nhập URL ảnh"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700"
                >
                  Thêm
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Thêm video</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Nhập URL video"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
                />
                <button
                  type="button"
                  onClick={addVideo}
                  className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700"
                >
                  Thêm
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {formData.videos.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tọa độ */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Tọa độ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="coordinates.latitude"
                  value={formData.coordinates.latitude}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="coordinates.longitude"
                  value={formData.coordinates.longitude}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
                />
              </div>
            </div>
          </div>

          {/* Đánh giá */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Đánh giá</label>
            <input
              type="number"
              name="rating"
              min="1"
              max="5"
              value={formData.rating}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 text-white rounded-md ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brown-600 hover:bg-brown-700'
              }`}
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm quán cafe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
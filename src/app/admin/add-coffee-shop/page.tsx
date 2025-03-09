'use client';

import { useState, useEffect, useRef } from 'react';
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

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

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  // Handle file input change
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  // Common function to handle files
  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setMessage({ type: '', content: '' });

    try {
      // Filter for only image files
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        throw new Error('Vui lòng chọn tệp hình ảnh');
      }

      // Check file sizes
      const oversizedFiles = imageFiles.filter(file => file.size > 20 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        throw new Error(`${oversizedFiles.length} tệp vượt quá giới hạn 20MB`);
      }

      const uploadPromises = imageFiles.map(async (file) => {
        // Create unique filename
        const timestamp = new Date().getTime();
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `coffee-shops/${fileName}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('coffee-shop-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('coffee-shop-images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setMessage({
        type: 'success',
        content: `Đã tải lên ${uploadedUrls.length} ảnh thành công!`
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      setMessage({
        type: 'error',
        content: error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải ảnh lên.'
      });
    } finally {
      setIsUploading(false);
    }
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
          {/* Left Zone - Image Upload */}
          <div className="w-1/2 p-6 border-r border-gray-200">
            <div 
              className={`h-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center relative
                ${dragActive ? 'border-brown-500 bg-brown-50' : 'border-gray-300'}
                ${isUploading ? 'border-gray-400 bg-gray-50' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-brown-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-sm text-gray-600">Đang tải lên...</p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-gray-600">
                    Kéo và thả ảnh vào đây hoặc
                  </p>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Chọn ảnh
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Chỉ chấp nhận file ảnh, kích thước tối đa 20MB
                  </p>
                </>
              )}

              {/* Preview Images */}
              {formData.images.length > 0 && (
                <div className="mt-6 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Ảnh đã tải lên ({formData.images.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Zone - Information Fields */}
          <div className="w-1/2 p-6 space-y-6">
            {/* Tên quán */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên quán</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên quán"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Thêm mô tả chi tiết về quán"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
              />
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
                <input
                  type="url"
                  name="fb_url"
                  value={formData.fb_url}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/..."
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
                  placeholder="https://instagram.com/..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500"
                />
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

            {/* Tọa độ */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Tọa độ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Latitude</label>
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
                  <label className="block text-sm text-gray-600">Longitude</label>
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

            {/* Submit Button */}
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
          </div>
        </form>
      </div>
    </div>
  );
} 
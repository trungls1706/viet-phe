'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CoffeeShop } from '@/lib/supabase/types';
import Image from 'next/image';

type FormData = Omit<CoffeeShop, 'id' | 'created_at'>;
interface UploadProgressEvent {
  loaded: number;
  total: number;
}

export default function AddCoffeeShop() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>(
    'checking'
  );
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
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  // Check Supabase connection when component mounts
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  // Add validation check effect
  useEffect(() => {
    const isValid = 
      formData.name.trim() !== '' && 
      formData.address.trim() !== '' && 
      formData.description.trim() !== '' &&
      formData.images.length > 0;
    
    setIsFormValid(isValid);
  }, [formData]);

  // Function to check Supabase connection
  const checkSupabaseConnection = async () => {
    try {
      setConnectionStatus('checking');
      // Try to query the coffee_shops table
      const { data, error } = await supabase.from('coffee_shops').select('id').limit(1);

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
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeImage = async (index: number) => {
    try {
      const imageUrl = formData.images[index];
      // Extract filename from URL
      const filename = imageUrl.split('/').pop();
      
      if (filename) {
        // Delete from Supabase storage
        const { error } = await supabase.storage
          .from('coffee-shop-images')
          .remove([filename]);

        if (error) {
          console.error('Error deleting image from storage:', error);
          setMessage({
            type: 'error',
            content: `Lỗi khi xóa ảnh: ${error.message}`,
          });
          return;
        }
      }

      // Remove from form state
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));

      setMessage({
        type: 'success',
        content: 'Đã xóa ảnh thành công!',
      });
    } catch (error) {
      console.error('Error removing image:', error);
      setMessage({
        type: 'error',
        content: 'Có lỗi xảy ra khi xóa ảnh.',
      });
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
    setUploadProgress({});

    try {
      // Validate file types
      const imageFiles = files.filter((file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
        if (!validTypes.includes(file.type)) {
          setMessage({
            type: 'error',
            content: `File "${file.name}" không phải là định dạng ảnh được hỗ trợ (JPG, PNG, WEBP, HEIC)`,
          });
          return false;
        }
        return true;
      });

      if (imageFiles.length === 0) {
        throw new Error('Vui lòng chọn tệp hình ảnh hợp lệ');
      }

      // Check file sizes
      const oversizedFiles = imageFiles.filter((file) => {
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
          setMessage({
            type: 'error',
            content: `File "${file.name}" vượt quá giới hạn 20MB`,
          });
          return true;
        }
        return false;
      });

      if (oversizedFiles.length > 0) {
        throw new Error(`${oversizedFiles.length} tệp vượt quá giới hạn 20MB`);
      }

      const uploadPromises = imageFiles.map(async (file) => {
        try {
          // Create unique filename with extension
          const timestamp = new Date().getTime();
          const fileExt = file.name.split('.').pop();
          const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}${fileExt ? `.${fileExt}` : ''}`;
          const filePath = fileName;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('coffee-shop-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              // @ts-ignore
              onUploadProgress: (progress: UploadProgressEvent) => {
                if (progress) {
                  const percent = (progress.loaded / progress.total) * 100;
                  setUploadProgress((prev) => ({
                    ...prev,
                    [fileName]: Math.round(percent),
                  }));
                }
              },
            });

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL
          const { data } = supabase.storage.from('coffee-shop-images').getPublicUrl(filePath);

          // Ensure we have a valid URL
          let publicUrl = data.publicUrl;
          if (!publicUrl.startsWith('https://')) {
            publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/coffee-shop-images/${filePath}`;
          }

          return publicUrl;
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          setMessage({
            type: 'error',
            content: `Lỗi khi tải lên file "${file.name}": ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
          });
          return null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter((url) => url !== null);

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));

        setMessage({
          type: 'success',
          content: `Đã tải lên ${uploadedUrls.length} ảnh thành công!`,
        });
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error handling files:', error);
      setMessage({
        type: 'error',
        content: error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý files.',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
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
              className={`h-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center relative cursor-pointer
                ${dragActive ? 'border-brown-500 bg-brown-50' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
                ${isUploading ? 'border-gray-400 bg-gray-50 cursor-wait' : ''}
                transition-all duration-200 ease-in-out
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <svg
                    className="animate-spin h-10 w-10 text-brown-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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
                    className="w-12 h-12 text-gray-400 group-hover:text-gray-500"
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
                    Kéo và thả ảnh vào đây hoặc click để chọn
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Chỉ chấp nhận file ảnh, kích thước tối đa 20MB
                  </p>
                </>
              )}

              {/* Preview Images */}
              {formData.images.length > 0 && (
                <div className="mt-8 w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Ảnh đã tải lên ({formData.images.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((url, index) => {
                      return (
                        <div key={index} className="relative group aspect-square">
                          <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              width={400}
                              height={400}
                              className="w-full h-full object-cover"
                              priority={index < 4}
                              quality={75}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                            title="Xóa ảnh"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Zone - Information Fields */}
          <div className="w-1/2 p-6 space-y-6">
            {/* Tên quán */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên quán"
                required
                className={`mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 ${
                  !formData.name.trim() ? 'border-red-300' : ''
                }`}
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ"
                required
                className={`mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 ${
                  !formData.address.trim() ? 'border-red-300' : ''
                }`}
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Thêm mô tả chi tiết về quán"
                rows={4}
                required
                className={`mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 ${
                  !formData.description.trim() ? 'border-red-300' : ''
                }`}
              />
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
                  placeholder="Thêm liên kết Facebook"
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
                  placeholder="Thêm liên kết Instagram"
                  className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Đánh giá */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">Đánh giá</label>
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                value={formData.rating}
                onChange={handleInputChange}
                placeholder="Nhập đánh giá từ 1-5"
                className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Tọa độ */}
            <div className="space-y-4">
              <h3 className="block text-base font-medium text-gray-900 mb-2">Tọa độ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="coordinates.latitude"
                    value={formData.coordinates.latitude}
                    onChange={handleInputChange}
                    placeholder="Vĩ độ"
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
                    placeholder="Kinh độ"
                    className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {Object.entries(uploadProgress).length > 0 && (
              <div className="mt-4 space-y-2">
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-xs font-semibold inline-block text-brown-600">
                        {fileName}
                      </div>
                      <div className="text-xs font-semibold inline-block text-brown-600">
                        {progress}%
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-brown-200">
                      <div
                        style={{ width: `${progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brown-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-full py-4 px-6 text-white text-lg font-medium rounded-[12px] shadow-lg transform transition-all duration-200 
                  ${isFormValid 
                    ? 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl' 
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang thêm...
                  </div>
                ) : (
                  'Thêm quán cafe'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

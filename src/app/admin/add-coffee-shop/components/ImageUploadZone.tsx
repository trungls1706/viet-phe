import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { useRef, useState, memo } from 'react';

interface UploadProgressEvent {
  loaded: number;
  total: number;
}

interface ImageUploadZoneProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  onMessage: (type: string, content: string) => void;
}

function ImageUploadZone({ images, onImagesChange, onMessage }: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const removeImage = async (index: number) => {
    try {
      const imageUrl = images[index];
      const filename = imageUrl.split('/').pop();
      
      if (filename) {
        const { error } = await supabase.storage
          .from('coffee-shop-images')
          .remove([filename]);

        if (error) {
          console.error('Error deleting image from storage:', error);
          onMessage('error', `Lỗi khi xóa ảnh: ${error.message}`);
          return;
        }
      }

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      onMessage('success', 'Đã xóa ảnh thành công!');
    } catch (error) {
      console.error('Error removing image:', error);
      onMessage('error', 'Có lỗi xảy ra khi xóa ảnh.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    onMessage('', '');
    setUploadProgress({});

    try {
      const imageFiles = files.filter((file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
        if (!validTypes.includes(file.type)) {
          onMessage('error', `File "${file.name}" không phải là định dạng ảnh được hỗ trợ (JPG, PNG, WEBP, HEIC)`);
          return false;
        }
        return true;
      });

      if (imageFiles.length === 0) {
        throw new Error('Vui lòng chọn tệp hình ảnh hợp lệ');
      }

      const oversizedFiles = imageFiles.filter((file) => {
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
          onMessage('error', `File "${file.name}" vượt quá giới hạn 20MB`);
          return true;
        }
        return false;
      });

      if (oversizedFiles.length > 0) {
        throw new Error(`${oversizedFiles.length} tệp vượt quá giới hạn 20MB`);
      }

      const uploadPromises = imageFiles.map(async (file) => {
        try {
          const timestamp = new Date().getTime();
          const fileExt = file.name.split('.').pop();
          const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}${fileExt ? `.${fileExt}` : ''}`;
          const filePath = fileName;

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

          const { data } = supabase.storage.from('coffee-shop-images').getPublicUrl(filePath);
          let publicUrl = data.publicUrl;
          if (!publicUrl.startsWith('https://')) {
            publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/coffee-shop-images/${filePath}`;
          }

          return publicUrl;
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          onMessage('error', `Lỗi khi tải lên file "${file.name}": ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
          return null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter((url) => url !== null);

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
        onMessage('success', `Đã tải lên ${uploadedUrls.length} ảnh thành công!`);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error handling files:', error);
      onMessage('error', error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý files.');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  return (
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

        {images.length > 0 && (
          <div className="mt-8 w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Ảnh đã tải lên ({images.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((url, index) => (
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
              ))}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}

export default memo(ImageUploadZone); 
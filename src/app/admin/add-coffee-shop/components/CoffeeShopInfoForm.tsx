import type { CoffeeShop } from '@/lib/supabase/types';
import { useMemo } from 'react';

type FormData = Omit<CoffeeShop, 'id' | 'created_at'>;

interface CoffeeShopInfoFormProps {
  formData: FormData;
  onFormDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
  isFormValid: boolean;
}

export default function CoffeeShopInfoForm({
  formData,
  onFormDataChange,
  isSubmitting,
  isFormValid,
}: CoffeeShopInfoFormProps) {
  return (
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
          onChange={onFormDataChange}
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
          onChange={onFormDataChange}
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
          onChange={onFormDataChange}
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
            onChange={onFormDataChange}
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
            onChange={onFormDataChange}
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
          onChange={onFormDataChange}
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
              onChange={onFormDataChange}
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
              onChange={onFormDataChange}
              placeholder="Kinh độ"
              className="mt-1 block w-full rounded-[12px] border-gray-200 shadow-sm py-4 px-4 text-base text-gray-900 placeholder:text-gray-500 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className={`w-full py-4 px-6 text-white text-lg font-medium rounded-[12px] shadow-lg transform transition-all duration-200 
            ${
              isFormValid
                ? 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
            }
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Đang thêm...
            </div>
          ) : (
            'Thêm quán cafe'
          )}
        </button>
      </div>
    </div>
  );
} 
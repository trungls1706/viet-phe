export type CoffeeShop = {
  id: string;
  created_at: string;
  name: string;          // Tên quán
  description: string;   // Thông tin mở rộng về quán (review)
  address: string;       // Địa chỉ
  instagram_url: string; // Instagram
  fb_url: string;       // Facebook
  images: string[];      // Mảng các URL ảnh
  videos: string[];      // Mảng các URL video
  rating: number;        // Đánh giá (1-5)
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export type Database = {
  public: {
    Tables: {
      coffee_shops: {
        Row: CoffeeShop;
        Insert: Omit<CoffeeShop, 'id' | 'created_at'>;
        Update: Partial<Omit<CoffeeShop, 'id' | 'created_at'>>;
      };
    };
  };
}; 

export type UserRole = 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
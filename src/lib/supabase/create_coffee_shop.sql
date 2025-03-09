-- Tạo bảng coffee_shops
create table public.coffee_shops (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  address text not null,
  instagram_url text,
  images text[] default '{}',
  videos text[] default '{}',
  rating smallint check (rating >= 1 and rating <= 5),
  is_verified boolean default false,
  opening_hours jsonb not null default '{
    "monday": "",
    "tuesday": "",
    "wednesday": "",
    "thursday": "",
    "friday": "",
    "saturday": "",
    "sunday": ""
  }',
  coordinates jsonb not null default '{
    "latitude": 0,
    "longitude": 0
  }'
);

-- Bật Row Level Security (RLS)
alter table public.coffee_shops enable row level security;

-- Tạo policy cho phép mọi người đọc dữ liệu
create policy "Anyone can read coffee shops"
  on public.coffee_shops
  for select
  using (true);

-- Tạo policy chỉ cho phép user đã đăng nhập thêm/sửa/xóa
create policy "Authenticated users can modify coffee shops"
  on public.coffee_shops
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------------------------

  -- Xóa bảng cũ nếu tồn tại
drop table if exists public.coffee_shops;

-- Tạo lại bảng với trường fb_url mới
create table public.coffee_shops (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  address text not null,
  instagram_url text,
  fb_url text,
  images text[] default '{}',
  videos text[] default '{}',
  rating smallint check (rating >= 1 and rating <= 5),
  coordinates jsonb not null default '{
    "latitude": 0,
    "longitude": 0
  }'
);

-- Bật Row Level Security (RLS)
alter table public.coffee_shops enable row level security;

-- Tạo policy cho phép mọi người đọc dữ liệu
create policy "Anyone can read coffee_shops"
  on public.coffee_shops
  for select
  using (true);

-- Tạo policy cho phép thêm/sửa/xóa
create policy "Anyone can modify coffee_shops"
  on public.coffee_shops
  for all
  using (true);
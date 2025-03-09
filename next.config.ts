import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['hvaxwtmvrvtxufmqtcdp.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hvaxwtmvrvtxufmqtcdp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
};

export default nextConfig;

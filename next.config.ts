import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['getformulai.com'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: 'https://getformulai.com',
  },
};

export default nextConfig;

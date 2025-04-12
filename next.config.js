/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['getformulai.com'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: 'https://getformulai.com',
  },
};

module.exports = nextConfig; 
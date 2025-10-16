/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ibb.co', 'i.ibb.co.com', 'storage.googleapis.com'], // Add your external image domain(s) here
  },
  reactStrictMode: false,
  output: 'standalone',
};

export default nextConfig;

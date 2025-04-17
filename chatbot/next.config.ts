/** @type {import('next').NextConfig} */
const nextConfig = {
  // Diğer Next.js yapılandırmalarınız buraya gelebilir, örneğin:
  // reactStrictMode: true,
  experimental: {
    // 'allowedDevOrigins' doğrudan 'experimental' nesnesinin içinde bir dizi olarak tanımlanmalı
    allowedDevOrigins: ['http://localhost:3000'], // Frontend geliştirme sunucunuzun adresi
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/:path*', // Backend adresiniz
      },
    ];
  },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.hdrezka.ac',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'desu.shikimori.one',
        port: '',
        pathname: '/**', 
      },
    ],
  },
};

export default nextConfig;

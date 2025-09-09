/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'static.hdrezka.ac', pathname: '/**' },
      { protocol: 'https', hostname: 'desu.shikimori.one', pathname: '/**' },
    ],
  },
};

export default nextConfig;

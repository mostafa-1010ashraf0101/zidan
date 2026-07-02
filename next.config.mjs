/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // لو بتستخدم جوجل درايف
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co', // لو بتستخدم ImgBB
      },
    ],
  },
};

export default nextConfig;
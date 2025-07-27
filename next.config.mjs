/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add webpack alias for @ paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
    }
    
    return config
  },
};

export default nextConfig;
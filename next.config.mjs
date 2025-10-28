/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double rendering in development
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  basePath: '',
  assetPrefix: '',
  publicRuntimeConfig: {
    basePath: '',
  },
  images: {
    unoptimized: true,
  },                                                                      
  eslint: {                                                                         
    ignoreDuringBuilds: true,                                                       
  },
};

export default nextConfig;

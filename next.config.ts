import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
    images: {
       unoptimized: true,
        remotePatterns: [
      {
        protocol: 'http',
        hostname: 'alsas.admin.t-carts.com',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'alsas.admin.t-carts.com',
        port: '',
        pathname: '/storage/**',
      },
         {
        protocol: 'http',
        hostname: 'alsas.admin.t-carts.com',
        port: '',
        pathname: '/**', 
      },
       {
        protocol: 'http', 
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    qualities: [75,85, 90], 
    domains: [], 
  },
};

export default nextConfig;



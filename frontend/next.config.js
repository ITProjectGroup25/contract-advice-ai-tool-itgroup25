/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      "postgres",
      "jose",
      "next-auth",
      "@auth/core",
      "@panva/hkdf",
      "preact",
      "preact-render-to-string",
      "uuid",
      "oauth4webapi",
      "drizzle-orm"
    ],
  },
  webpack: (config, { isServer }) => {
    // Add webpack alias for workspace packages  
    config.resolve.alias = {
      ...config.resolve.alias,
      '@backend': require('path').resolve(__dirname, '../backend/src'),
      '@shared': require('path').resolve(__dirname, '../shared/src'),
    };
    
    // For server-side, externalize certain packages to avoid bundling issues
    if (isServer) {
      config.externals = config.externals || [];
      // Don't bundle jose and crypto libraries
      config.externals.push('jose', '@panva/hkdf', 'oauth4webapi');
    }
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
    ],
  },
};

module.exports = nextConfig;

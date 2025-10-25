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
      "drizzle-orm",
    ],
  },
  webpack: (config, { isServer }) => {
    // Add webpack alias for workspace packages
    config.resolve.alias = {
      ...config.resolve.alias,
      "@backend": require("path").resolve(__dirname, "../backend/src"),
      "@shared": require("path").resolve(__dirname, "../shared/src"),
    };

    // For server-side, externalize certain packages to avoid bundling issues
    if (isServer) {
      // More aggressive externalization
      const originalExternals = config.externals || [];
      config.externals = [
        ...originalExternals,
        // Externalize auth-related packages
        "jose",
        "@panva/hkdf",
        "oauth4webapi",
        "next-auth",
        "@auth/core",
        "@auth/drizzle-adapter",
        "preact",
        "preact-render-to-string",
        // Externalize anything from @auth namespace
        ({ request }, callback) => {
          if (
            request?.startsWith("@auth/") ||
            request?.startsWith("jose") ||
            request?.startsWith("oauth4webapi") ||
            request === "drizzle-orm" ||
            request?.startsWith("drizzle-orm/")
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        net: false,
        tls: false,
      }
    }

    config.module.rules.push({
      test: /\.node$/,
      use: "raw-loader",
    })

    return config
  },
  transpilePackages: ["lucide-react", "@radix-ui/react-icons"],
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
}

module.exports = nextConfig

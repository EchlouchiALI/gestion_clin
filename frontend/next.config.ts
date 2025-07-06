import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: true, // ✅ Ajoute cette ligne
  },
}

export default nextConfig

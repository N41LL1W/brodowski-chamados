import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  images: {
    // Permite carregar imagens de qualquer lugar. 
    // Ideal para quando você usa múltiplos serviços de upload ou URLs externas.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // O asterisco duplo aceita todos os domínios
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
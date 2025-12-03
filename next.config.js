/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar strict mode apenas para evitar double renders em dev
  reactStrictMode: true,

  // Suporte a variáveis de ambiente
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Otimizações para Netlify
  swcMinify: true,

  // Evitar erros de ESLint durante build
  eslint: {
    // ATENÇÃO: Isso ignora erros de ESLint durante build em PRODUÇÃO
    // Remova esta linha quando todos os warnings estiverem corrigidos
    ignoreDuringBuilds: false,
  },

  // Evitar erros de TypeScript durante build
  typescript: {
    // ATENÇÃO: Isso ignora erros de TypeScript durante build em PRODUÇÃO
    // Remova esta linha quando todos os erros estiverem corrigidos
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

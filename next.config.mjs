/** Página estática: `next build` gera a pasta out/ pronta para Cloudflare Pages (ou qualquer hospedagem estática). */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default nextConfig;

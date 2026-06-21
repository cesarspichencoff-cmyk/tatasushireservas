/**
 * basePath é definido pelo workflow conforme o repositório:
 *   - repo "<nome>.github.io"  → site na raiz, basePath vazio
 *   - repo "tatasushireservas" → site em /tatasushireservas
 * Localmente (sem a env) também roda na raiz.
 */
const basePath = process.env.PAGES_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  transpilePackages: ['pdfjs-dist'],
  webpack: (config) => {
    // pdfjs tenta usar canvas para renderização; apenas extraímos texto
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;

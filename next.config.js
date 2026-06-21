/** @type {import('next').NextConfig} */
const pkg = require('./package.json');
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version
  },
  // v1.99: selectively merged from Claude v1.94 Optimized.
  // Standalone output reduces deploy footprint without moving private_vault into runtime.
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  turbopack: {
    root: __dirname
  },
  // Preserved from v1.98 to keep constrained/local builds stable in this environment.
  experimental: {
    cpus: 1,
    workerThreads: false
  }
};

module.exports = nextConfig;

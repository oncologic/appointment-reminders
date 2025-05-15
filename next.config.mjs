/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Report all TypeScript errors instead of stopping at the first one
    ignoreBuildErrors: false,
    // Show all errors at once for easier debugging
    tsconfigPath: './tsconfig.json',
  },
};

export default nextConfig;

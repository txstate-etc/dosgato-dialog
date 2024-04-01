import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  build: { sourcemap: true },
  css: { devSourcemap: true },
  optimizeDeps: {
    exclude: ['@iconify-icons/ph'] // exclude iconify libraries to preserve HMR
  }
};

export default config;

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');
  return {
    plugins: [react()],
    envDir: '..',
    server: {
      port: Number(env.FRONTEND_PORT || 3000),
      strictPort: true,
      proxy: {
        '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:8000' },
      },
    },
    preview: { port: Number(env.FRONTEND_PORT || 3000), strictPort: true },
    build: { outDir: 'build' },
  };
});

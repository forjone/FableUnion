/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 图片生成走同源代理，避免浏览器直连第三方 API 的 CORS 问题。
// 生产部署时需在网关配置同样的转发（/imggen/* → 图片生成服务）。
const imggenProxy = {
  '/imggen': {
    target: 'https://sub.tkrednote.com',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/imggen/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: imggenProxy },
  preview: { proxy: imggenProxy },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

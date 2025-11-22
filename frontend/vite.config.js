import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000
        // 可选：开发时如果不想在后端启 CORS，可打开 proxy 配置把 /api 转发到后端
        // proxy: {
        //   '/api': {
        //     target: 'http://localhost:8081',
        //     changeOrigin: true
        //   }
        // }
    }
});
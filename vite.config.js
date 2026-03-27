import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './', // 빌드 시 상대 경로 사용 (Electron 배포용 필수 설정)
  server: {
    port: 3000
  }
})

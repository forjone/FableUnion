// Capacitor 配置：把 Web 构建产物打包成 iOS/iPad 原生应用（V2 路线）。
// 使用步骤见 README「打包 iOS 应用」一节。

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fableunion.xiaoling',
  appName: '小灵造造',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    backgroundColor: '#F4E4CE',
  },
  server: {
    // 原生壳内同样需要把 /imggen 转发到图片生成服务（或改用完整 API 地址）
  },
};

export default config;

import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { getUser, getToken } from '@/utils/auth';
import './app.scss';

let isMPReady = false;

function App({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 小程序启动时自动缓存用户最后已知位置
    Taro.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success(res) {
        Taro.setStorageSync('last_known_lat', res.latitude);
        Taro.setStorageSync('last_known_lng', res.longitude);
      },
      fail() {
        // 无法获取位置时使用缓存
      },
    });

    // 检查登录状态
    const token = getToken();
    const user = getUser();
    if (token && user) {
      isMPReady = true;
    }

    // 存储初始化标记
    Taro.setStorageSync('app_initialized', true);
  }, []);

  return <>{children}</>;
}

export { isMPReady };
export default App;

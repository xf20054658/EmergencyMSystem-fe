'use client';

// ============================================================
// Root Redirect — 根据 UA 判断 PC / Mobile，跳转对应路由
// ============================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod/.test(ua);
    // PC 指挥中心 or Mobile 群众端
    const target = isMobile ? '/m' : '/pc';
    router.replace(target);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-terminal-bg">
      <div className="text-terminal-muted text-sm">加载中...</div>
    </div>
  );
}

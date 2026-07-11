'use client';

// ============================================================
// Mobile 布局 — TabBar + 5 页面切换
// ============================================================

import React, { useState, useMemo } from 'react';
import { TabBar, type MobileTab } from './TabBar';
import { MobileHomeView } from './MobileHomeView';
import { MobileMapView } from './MobileMapView';
import { MobileReportView } from './MobileReportView';
import { MobileHelpView } from './MobileHelpView';
import { MobileProfileView } from './MobileProfileView';

export function MobileLayout() {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');

  const renderView = useMemo(() => {
    switch (activeTab) {
      case 'home': return <MobileHomeView />;
      case 'map': return <MobileMapView />;
      case 'report': return <MobileReportView />;
      case 'help': return <MobileHelpView />;
      case 'profile': return <MobileProfileView />;
      default: return <MobileHomeView />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-ios-bg text-ios-text max-w-mobile mx-auto relative pb-[60px]">
      {renderView}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

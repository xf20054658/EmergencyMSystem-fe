'use client';

// ============================================================
// Mobile TabBar — 底部 5 Tab 导航
// ============================================================

import React from 'react';

export type MobileTab = 'home' | 'map' | 'report' | 'help' | 'profile';

interface TabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const TABS: { id: MobileTab; label: string; icon: string }[] = [
  { id: 'home', label: '首页', icon: '🏠' },
  { id: 'map', label: '灾情', icon: '🗺️' },
  { id: 'report', label: '求助', icon: '📝' },
  { id: 'help', label: '帮忙', icon: '🤝' },
  { id: 'profile', label: '我的', icon: '📋' },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ios-card border-t border-ios-separator flex items-center justify-around h-[60px] z-50 ios-shadow"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const isReport = tab.id === 'report';
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors -mt-1
              ${isReport ? 'relative -mt-3' : ''}
              ${isActive && !isReport ? 'text-ios-blue' : 'text-ios-muted'}
            `}
          >
            {isReport ? (
              <div className="w-12 h-12 bg-ios-red rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-red-500/30 -mt-2">
                {tab.icon}
              </div>
            ) : (
              <>
                <span className="text-xl">{tab.icon}</span>
                <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

'use client';

// ============================================================
// PC Sidebar — 左侧导航栏（9 视图切换）
// ============================================================

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type ViewId = 'dashboard' | 'requests' | 'matches' | 'map' | 'resources' | 'teams' | 'volunteers' | 'shelters' | 'analytics';

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}

const NAV_ITEMS: { id: ViewId; label: string; icon: string }[] = [
  { id: 'dashboard', label: '指挥总览', icon: '◉' },
  { id: 'requests', label: '求助管理', icon: '☷' },
  { id: 'matches', label: '匹配监控', icon: '⚡' },
  { id: 'map', label: '灾情地图', icon: '◎' },
  { id: 'resources', label: '物资调度', icon: '▣' },
  { id: 'teams', label: '救援队伍', icon: '✦' },
  { id: 'volunteers', label: '志愿者管理', icon: '♜' },
  { id: 'shelters', label: '安置点', icon: '⌂' },
  { id: 'analytics', label: '数据分析', icon: '◈' },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-[220px] bg-terminal-card border-r border-terminal-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-terminal-border">
        <div className="flex items-center gap-2">
          <span className="text-terminal-accent text-xl font-bold">◉</span>
          <div>
            <div className="text-terminal-text text-sm font-semibold leading-tight">应急指挥</div>
            <div className="text-terminal-muted text-[10px] leading-tight">Guangxi EMS v2.1</div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 overflow-y-auto terminal-scrollbar">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors duration-150
              ${activeView === item.id
                ? 'bg-terminal-accent/10 text-terminal-accent border-r-2 border-terminal-accent'
                : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-border/50'
              }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="px-5 py-4 border-t border-terminal-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-terminal-accent/20 flex items-center justify-center text-terminal-accent text-xs font-bold">
            {(user?.name || 'A')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-terminal-text text-xs font-medium truncate">
              {user?.name || '未登录'}
            </div>
            <div className="text-terminal-muted text-[10px]">
              {user?.role === 'admin' ? '管理员' : user?.role === 'dispatcher' ? '调度员' : '用户'}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-terminal-muted hover:text-terminal-danger text-xs text-left transition-colors"
        >
          ← 退出登录
        </button>
      </div>
    </aside>
  );
}

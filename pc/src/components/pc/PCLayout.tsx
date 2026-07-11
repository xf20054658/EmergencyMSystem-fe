'use client';

// ============================================================
// PC 指挥中心布局 — Sidebar + Header + View Area
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar, type ViewId } from './Sidebar';
import { Header } from './Header';
import { DashboardView } from './DashboardView';
import { HelpRequestsView } from './HelpRequestsView';
import { MatchMonitorView } from './MatchMonitorView';
import { DisasterMapView } from './DisasterMapView';
import { ResourcesView } from './ResourcesView';
import { RescueTeamsView } from './RescueTeamsView';
import { VolunteersView } from './VolunteersView';
import { SheltersView } from './SheltersView';
import { AnalyticsView } from './AnalyticsView';
import { dashboardApi } from '@/api';
import type { DashboardStats } from '@/types/models';

const VIEW_TITLES: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: { title: '指挥总览', subtitle: '应急指挥中心 · 实时数据看板' },
  requests: { title: '求助管理', subtitle: '所有求助请求 · 多维筛选与追踪' },
  matches: { title: '匹配监控', subtitle: '实时匹配流 · 超时检测 · 状态追踪' },
  map: { title: '灾情地图', subtitle: '广西全域 · 求助分布 · 安置点 · 志愿者' },
  resources: { title: '物资调度', subtitle: '8 类应急物资 · 物流批次追踪' },
  teams: { title: '救援队伍', subtitle: '认证救援队 · 人员配置 · 出动状态' },
  volunteers: { title: '志愿者管理', subtitle: 'Tier 分级 · 信任分 · 技能 · 防滥用' },
  shelters: { title: '安置点', subtitle: '容量管理 · 入住率监控' },
  analytics: { title: '数据分析', subtitle: '匹配效率指标 · 趋势分析 · 30 天统计' },
};

export function PCLayout() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [summaryStats, setSummaryStats] = useState<DashboardStats | null>(null);
  const [alertCount, setAlertCount] = useState(0);

  // 定时拉取全局统计（用于 Sidebar 徽章 + Header 预警）
  useEffect(() => {
    async function fetchSummary() {
      try {
        const [stats, alerts] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getEscalations({ status: 'pending' }),
        ]);
        setSummaryStats(stats);
        setAlertCount(alerts.length);
      } catch { /* 静默 */ }
    }
    fetchSummary();
    const timer = setInterval(fetchSummary, 30000);
    return () => clearInterval(timer);
  }, []);

  const viewInfo = VIEW_TITLES[activeView];

  const renderView = useMemo(() => {
    switch (activeView) {
      case 'dashboard': return <DashboardView onStatsUpdate={setSummaryStats} />;
      case 'requests': return <HelpRequestsView />;
      case 'matches': return <MatchMonitorView />;
      case 'map': return <DisasterMapView />;
      case 'resources': return <ResourcesView />;
      case 'teams': return <RescueTeamsView />;
      case 'volunteers': return <VolunteersView />;
      case 'shelters': return <SheltersView />;
      case 'analytics': return <AnalyticsView />;
      default: return <DashboardView onStatsUpdate={setSummaryStats} />;
    }
  }, [activeView]);

  // 预警横幅
  const alertBanner = (summaryStats?.pending_requests ?? 0) > 0 || alertCount > 0 ? {
    level: alertCount > 0 ? ('red' as const) : ('orange' as const),
    text: alertCount > 0 ? `防汛II级应急响应 · ${alertCount}条升级告警待处理` : '防汛III级应急响应 · 请关注实时数据',
    pendingRequests: summaryStats?.pending_requests ?? 0,
    activeAlerts: alertCount,
  } : undefined;

  return (
    <div className="h-screen flex bg-terminal-bg text-terminal-text overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        badges={{
          pendingRequests: summaryStats?.pending_requests ?? 0,
          activeAlerts: alertCount,
          activeMatches: summaryStats?.active_matches ?? 0,
        }}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={viewInfo.title} subtitle={viewInfo.subtitle} alertBanner={alertBanner} />
        <div className="flex-1 overflow-hidden">
          {renderView}
        </div>
        <footer className="h-8 px-4 bg-terminal-card border-t border-terminal-border flex items-center text-terminal-muted text-[10px]">
          <span>Guangxi EMS v2.1</span>
          <span className="mx-2">|</span>
          <span>{new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</span>
        </footer>
      </div>
    </div>
  );
}

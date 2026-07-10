'use client';

// ============================================================
// View 1: 指挥总览 — KPI 仪表盘 + 实时流 + 面板
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { DashboardStats, Announcement, RescueUpdate, Escalation } from '@/types/models';
import { AlertLevelBadge, UrgencyBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [updates, setUpdates] = useState<RescueUpdate[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a, u, e] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getAnnouncements(),
          dashboardApi.getRescueUpdates(),
          dashboardApi.getEscalations({ status: 'pending' }),
        ]);
        setStats(s);
        setAnnouncements(a);
        setUpdates(u.slice(0, 10));
        setEscalations(e);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="待处理求助" value={stats?.pending_requests ?? 0} color="text-red-400" bg="bg-red-400/5" border="border-red-400/20" />
        <KpiCard label="活跃匹配" value={stats?.active_matches ?? 0} color="text-terminal-accent" bg="bg-terminal-accent/5" border="border-terminal-accent/20" />
        <KpiCard label="可用志愿者" value={stats?.available_volunteers ?? 0} color="text-green-400" bg="bg-green-400/5" border="border-green-400/20" />
        <KpiCard label="安置点入住率" value={`${(stats?.shelter_occupancy_rate ?? 0).toFixed(1)}%`} color="text-blue-400" bg="bg-blue-400/5" border="border-blue-400/20" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* 公告 + 告警 */}
        <div className="col-span-2 space-y-4">
          {/* 公告 */}
          <Panel title="📢 最新公告" count={announcements.length}>
            {announcements.length === 0 ? (
              <div className="text-terminal-muted text-xs py-2">暂无公告</div>
            ) : (
              announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-start gap-2 py-2 border-b border-terminal-border last:border-0">
                  <AlertLevelBadge level={a.level} className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-terminal-text text-xs font-medium truncate">{a.title}</div>
                    <div className="text-terminal-muted text-[10px] mt-0.5">{new Date(a.published_at).toLocaleString('zh-CN')}</div>
                  </div>
                </div>
              ))
            )}
          </Panel>

          {/* 升级告警 */}
          <Panel title="🚨 升级告警" count={escalations.length}>
            {escalations.length === 0 ? (
              <div className="text-terminal-muted text-xs py-2">暂无告警</div>
            ) : (
              escalations.map((e) => (
                <div key={e.id} className="flex items-center gap-2 py-2 border-b border-terminal-border last:border-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="text-terminal-text text-xs truncate">{e.escalate_reason}</div>
                    <div className="text-terminal-muted text-[10px]">{new Date(e.created_at).toLocaleTimeString('zh-CN')}</div>
                  </div>
                </div>
              ))
            )}
          </Panel>
        </div>

        {/* 动态时间线 */}
        <Panel title="⏱ 救援动态" className="h-full">
          {updates.length === 0 ? (
            <div className="text-terminal-muted text-xs py-2">暂无动态</div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto terminal-scrollbar">
              {updates.map((u, i) => (
                <div key={u.id || i} className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-terminal-accent mt-1.5" />
                    {i < updates.length - 1 && <div className="w-px flex-1 bg-terminal-border my-0.5" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="text-terminal-text text-xs leading-relaxed">{u.content}</div>
                    <div className="text-terminal-muted text-[10px] mt-0.5">{new Date(u.created_at).toLocaleTimeString('zh-CN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, bg, border }: { label: string; value: string | number; color: string; bg: string; border: string }) {
  return (
    <div className={`${bg} ${border} border rounded-lg p-4`}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-terminal-muted text-xs mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Panel({ title, count, children, className = '' }: { title: string; count?: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-terminal-card border border-terminal-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider">{title}</h3>
        {count !== undefined && <span className="text-terminal-muted text-[10px]">{count}</span>}
      </div>
      {children}
    </div>
  );
}

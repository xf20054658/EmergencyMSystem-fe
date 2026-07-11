'use client';

// ============================================================
// View 1: 指挥总览 — KPI + 地图 + 实时Feed + 物资 + 风险面板
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { DashboardStats, Announcement, RescueUpdate, Escalation, HelpRequest, Resource } from '@/types/models';
import { AlertLevelBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const GUANGXI_CITIES = [
  { name: '南宁', lat: 22.817, lng: 108.366 },
  { name: '柳州', lat: 24.326, lng: 109.428 },
  { name: '桂林', lat: 25.274, lng: 110.290 },
  { name: '梧州', lat: 23.477, lng: 111.279 },
  { name: '北海', lat: 21.473, lng: 109.119 },
  { name: '防城港', lat: 21.687, lng: 108.355 },
  { name: '钦州', lat: 21.981, lng: 108.654 },
  { name: '贵港', lat: 23.111, lng: 109.599 },
  { name: '玉林', lat: 22.654, lng: 110.181 },
  { name: '百色', lat: 23.902, lng: 106.618 },
  { name: '贺州', lat: 24.404, lng: 111.567 },
  { name: '河池', lat: 24.693, lng: 108.085 },
  { name: '来宾', lat: 23.750, lng: 109.221 },
  { name: '崇左', lat: 22.377, lng: 107.365 },
];

const LON_RANGE = [104.5, 112.0];
const LAT_RANGE = [20.9, 26.4];
const toSvgX = (lng: number) => ((lng - LON_RANGE[0]) / (LON_RANGE[1] - LON_RANGE[0])) * 100;
const toSvgY = (lat: number) => 100 - ((lat - LAT_RANGE[0]) / (LAT_RANGE[1] - LAT_RANGE[0])) * 100;

interface DashboardViewProps {
  onStatsUpdate?: (stats: DashboardStats) => void;
}

export function DashboardView({ onStatsUpdate }: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [updates, setUpdates] = useState<RescueUpdate[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [recentRequests, setRecentRequests] = useState<HelpRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a, u, e, reqs, res] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getAnnouncements(),
          dashboardApi.getRescueUpdates(),
          dashboardApi.getEscalations({ status: 'pending' }),
          dashboardApi.getRecentRequests(20),
          dashboardApi.getResources(),
        ]);
        setStats(s);
        setAnnouncements(a);
        setUpdates(u.slice(0, 15));
        setEscalations(e);
        setRecentRequests(reqs);
        setResources(res);
        onStatsUpdate?.(s);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onStatsUpdate]);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  const riskLevel = (escalations.length > 3 || (stats?.pending_requests ?? 0) > 20) ? '高' :
    (escalations.length > 0 || (stats?.pending_requests ?? 0) > 10) ? '中' : '低';
  const riskColor = riskLevel === '高' ? 'text-red-400' : riskLevel === '中' ? 'text-orange-400' : 'text-green-400';

  return (
    <div className="p-4 overflow-y-auto flex-1 space-y-4">
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="待处理求助" value={stats?.pending_requests ?? 0} color="text-red-400" bg="bg-red-400/5" border="border-red-400/20" trend="↑12%" trendUp />
        <KpiCard label="活跃匹配" value={stats?.active_matches ?? 0} color="text-terminal-accent" bg="bg-terminal-accent/5" border="border-terminal-accent/20" />
        <KpiCard label="可用志愿者" value={stats?.available_volunteers ?? 0} color="text-green-400" bg="bg-green-400/5" border="border-green-400/20" trend="↑5%" trendUp />
        <KpiCard label="安置点入住率" value={`${(stats?.shelter_occupancy_rate ?? 0).toFixed(1)}%`} color="text-blue-400" bg="bg-blue-400/5" border="border-blue-400/20" />
      </div>

      {/* Row 2: 地图预览 + 风险/告警面板 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 地图预览 */}
        <div className="col-span-2 bg-terminal-card border border-terminal-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider">🗺 灾情态势地图</h3>
            <span className="text-terminal-muted text-[10px]">{recentRequests.length} 个活跃点位</span>
          </div>
          <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: '240px' }}>
            {/* 网格 */}
            {Array.from({ length: 6 }, (_, i) => (
              <React.Fragment key={`g-${i}`}>
                <line x1={i * 20} y1={0} x2={i * 20} y2={100} stroke="#1E1E24" strokeWidth={0.15} />
                <line x1={0} y1={i * 20} x2={100} y2={i * 20} stroke="#1E1E24" strokeWidth={0.15} />
              </React.Fragment>
            ))}
            {/* 城市标签 */}
            {GUANGXI_CITIES.map((city) => (
              <text key={city.name} x={toSvgX(city.lng)} y={toSvgY(city.lat)}
                textAnchor="middle" fill="#52525B" fontSize="1.8">{city.name}</text>
            ))}
            {/* 求助点（按紧急度着色） */}
            {recentRequests.map((r) => {
              const color = r.urgency === 'critical' ? '#FF4444' : r.urgency === 'high' ? '#FF8800' : r.urgency === 'medium' ? '#FFD600' : '#2979FF';
              return (
                <circle key={r.id} cx={toSvgX(r.lng)} cy={toSvgY(r.lat)}
                  r={r.urgency === 'critical' ? 2.2 : 1.3} fill={color} opacity={0.75}>
                  <title>{r.title} [{r.urgency}]</title>
                </circle>
              );
            })}
          </svg>
          <div className="flex items-center justify-center gap-4 mt-1.5 text-[9px] text-terminal-muted">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 特大</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> 重大</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> 较大</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 一般</span>
          </div>
        </div>

        {/* 风险 + 告警面板 */}
        <div className="space-y-3">
          {/* 风险等级 */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-2">⚠ 综合风险等级</h3>
            <div className={`text-3xl font-bold text-center py-2 ${riskColor}`}>{riskLevel}</div>
            <div className="flex justify-between text-[10px] text-terminal-muted">
              <span>告警: {escalations.length}条</span>
              <span>待处理: {stats?.pending_requests ?? 0}条</span>
            </div>
          </div>

          {/* 快捷告警 */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-3 flex-1">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-2">🚨 升级告警</h3>
            {escalations.length === 0 ? (
              <div className="text-terminal-muted text-[10px] py-1">暂无升级告警</div>
            ) : (
              <div className="space-y-1.5 max-h-[130px] overflow-y-auto terminal-scrollbar">
                {escalations.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span className="text-terminal-text text-[10px] truncate flex-1">{e.escalate_reason}</span>
                    <span className="text-terminal-muted text-[9px] shrink-0">{new Date(e.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: 实时求助Feed + 物资概览 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 实时求助 Feed */}
        <div className="col-span-2 bg-terminal-card border border-terminal-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider">📋 实时求助流</h3>
            <span className="text-terminal-muted text-[10px]">最近 {recentRequests.length} 条</span>
          </div>
          {recentRequests.length === 0 ? (
            <div className="text-terminal-muted text-[10px] py-2">暂无求助记录</div>
          ) : (
            <div className="space-y-1 max-h-[260px] overflow-y-auto terminal-scrollbar">
              {recentRequests.slice(0, 12).map((r) => {
                const urgencyColor = r.urgency === 'critical' ? 'border-red-500' : r.urgency === 'high' ? 'border-orange-500' : r.urgency === 'medium' ? 'border-yellow-500' : 'border-blue-500';
                const statusLabel = r.status === 'pending' ? '待处理' : r.status === 'processing' ? '处理中' : r.status === 'resolved' ? '已解决' : '已取消';
                const statusStyle = r.status === 'pending' ? 'text-red-400' : r.status === 'processing' ? 'text-terminal-accent' : 'text-terminal-muted';
                return (
                  <div key={r.id} className={`flex items-center gap-2 pl-2 border-l-2 ${urgencyColor} py-1.5 hover:bg-terminal-border/20 rounded-r transition-colors`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-terminal-text text-[11px] font-medium truncate">{r.title || '未命名求助'}</div>
                      <div className="text-terminal-muted text-[9px] truncate">{r.address || '未标记地址'}</div>
                    </div>
                    <span className={`text-[9px] font-medium shrink-0 ${statusStyle}`}>{statusLabel}</span>
                    <span className="text-terminal-muted text-[9px] shrink-0 w-12 text-right">
                      {new Date(r.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 物资概览 + 公告 */}
        <div className="space-y-3">
          {/* 物资概览 */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-2">📦 物资概览</h3>
            {resources.length === 0 ? (
              <div className="text-terminal-muted text-[10px] py-1">暂无物资数据</div>
            ) : (
              <div className="space-y-1.5 max-h-[130px] overflow-y-auto terminal-scrollbar">
                {resources.slice(0, 5).map((res) => {
                  const ratio = res.total_quantity > 0 ? (res.available_quantity / res.total_quantity) * 100 : 0;
                  const barColor = ratio > 60 ? 'bg-green-500' : ratio > 30 ? 'bg-terminal-accent' : 'bg-red-500';
                  return (
                    <div key={res.id}>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-terminal-text truncate flex-1 mr-2">{res.name}</span>
                        <span className="text-terminal-muted shrink-0">{res.available_quantity}/{res.total_quantity} {res.unit}</span>
                      </div>
                      <div className="w-full h-1 bg-terminal-border rounded-full mt-0.5">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(ratio, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 最新公告 */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-3 flex-1">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-2">📢 最新公告</h3>
            {announcements.length === 0 ? (
              <div className="text-terminal-muted text-[10px] py-1">暂无公告</div>
            ) : (
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto terminal-scrollbar">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-start gap-1.5">
                    <AlertLevelBadge level={a.level} className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-terminal-text text-[10px] font-medium truncate">{a.title}</div>
                      <div className="text-terminal-muted text-[8px]">{new Date(a.published_at).toLocaleDateString('zh-CN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: 救援动态时间线 */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider">⏱ 救援动态</h3>
          <span className="text-terminal-muted text-[10px]">{updates.length} 条动态</span>
        </div>
        {updates.length === 0 ? (
          <div className="text-terminal-muted text-[10px] py-1">暂无动态</div>
        ) : (
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 max-h-[160px] overflow-y-auto terminal-scrollbar">
            {updates.slice(0, 15).map((u, i) => (
              <div key={u.id || i} className="flex gap-1.5">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-terminal-accent mt-1" />
                  {i < updates.length - 1 && <div className="w-px flex-1 bg-terminal-border my-0.5" />}
                </div>
                <div className="flex-1 pb-1.5 min-w-0">
                  <div className="text-terminal-text text-[10px] leading-relaxed truncate">{u.content}</div>
                  <div className="text-terminal-muted text-[8px]">{new Date(u.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, bg, border, trend, trendUp }: {
  label: string; value: string | number; color: string; bg: string; border: string;
  trend?: string; trendUp?: boolean;
}) {
  return (
    <div className={`${bg} ${border} border rounded-lg p-3`}>
      <div className="flex items-end justify-between">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {trend && (
          <span className={`text-[10px] font-medium ${trendUp ? 'text-red-400' : 'text-green-400'}`}>{trend}</span>
        )}
      </div>
      <div className="text-terminal-muted text-[10px] uppercase tracking-wider">{label}</div>
    </div>
  );
}


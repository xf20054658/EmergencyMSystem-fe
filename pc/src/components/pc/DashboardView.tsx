'use client';

// ============================================================
// View 1: 指挥总览 — 对齐原型设计
// 5个指标 + 灾区地图 + 实时求助动态 + 物资供需 + 风险等级 + 最新公告
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { DashboardStats, Announcement, Escalation, HelpRequest, Resource, Match } from '@/types/models';
import { AlertLevelBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  MOCK_STATS,
  MOCK_ANNOUNCEMENTS,
  MOCK_ESCALATIONS,
  MOCK_REQUESTS,
  MOCK_RESOURCES,
  MOCK_MATCHES,
} from '@/mock/data';

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

/** 把 HelpRequest 转为旧版 Mock 格式的地图点 */
function toMapPoint(r: HelpRequest) {
  return {
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    urgency: r.urgency,
    title: r.title,
  };
}

export function DashboardView({ onStatsUpdate }: { onStatsUpdate?: (stats: DashboardStats) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [recentRequests, setRecentRequests] = useState<HelpRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a, e, reqs, res, matchData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getAnnouncements(),
          dashboardApi.getEscalations({ status: 'pending' }),
          dashboardApi.getRecentRequests(20),
          dashboardApi.getResources(),
          dashboardApi.getRecentMatches(20),
        ]);
        setStats(s || MOCK_STATS);
        setAnnouncements(a?.length > 0 ? a : MOCK_ANNOUNCEMENTS);
        setEscalations(e?.length > 0 ? e : MOCK_ESCALATIONS);
        setRecentRequests(reqs?.length > 0 ? reqs : MOCK_REQUESTS);
        setResources(res?.length > 0 ? res : MOCK_RESOURCES);
        setMatches(matchData?.length > 0 ? matchData : MOCK_MATCHES);
        onStatsUpdate?.(s || MOCK_STATS);
      } catch (err) {
        console.error('Dashboard load error:', err);
        // 全部回退到 mock
        setStats(MOCK_STATS);
        setAnnouncements(MOCK_ANNOUNCEMENTS);
        setEscalations(MOCK_ESCALATIONS);
        setRecentRequests(MOCK_REQUESTS);
        setResources(MOCK_RESOURCES);
        setMatches(MOCK_MATCHES);
        onStatsUpdate?.(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onStatsUpdate]);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  // P2P 匹配统计
  const p2pMatches = matches.filter((m) => m.route === 'p2p').length;
  const p2pOngoing = matches.filter((m) => m.route === 'p2p' && ['accepted', 'enroute'].includes(m.status || '')).length;
  const p2pTimeout = matches.filter((m) => m.route === 'p2p' && m.status === 'timeout').length;

  // 风险等级
  const riskLevel =
    escalations.length > 3 || (stats?.pending_requests ?? 0) > 20
      ? '高'
      : escalations.length > 0 || (stats?.pending_requests ?? 0) > 10
        ? '中'
        : '低';
  const riskColor = riskLevel === '高' ? 'text-red-400' : riskLevel === '中' ? 'text-orange-400' : 'text-green-400';

  // 告警横幅：从 Escalation 数据构建
  const displayAlerts = escalations.slice(0, 2).map((e) => ({
    type: 'danger' as const,
    title: '升级告警',
    detail: e.escalate_reason,
    time: new Date(e.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    code: e.match_id.slice(0, 12),
    action: '立即处理',
  }));

  const displayRequests = recentRequests;

  // 地图灾情点
  const mapPoints = recentRequests.map(toMapPoint);

  return (
    <div className="p-4 overflow-y-auto flex-1 space-y-4">
      {/* ===== Row 1: 告警通知栏 ===== */}
      <div className="space-y-2">
        {displayAlerts.map((alert, i) => (
          <div
            key={i}
            className={`rounded-lg px-4 py-2.5 flex items-center justify-between ${
              alert.type === 'danger'
                ? 'bg-red-400/10 border border-red-400/20'
                : 'bg-yellow-400/10 border border-yellow-400/20'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${alert.type === 'danger' ? 'bg-red-400' : 'bg-yellow-400'}`} />
              <span className="text-terminal-text text-xs font-medium shrink-0">{alert.title}</span>
              <span className="text-terminal-muted text-xs truncate">{alert.detail}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="text-terminal-muted text-xs">{alert.time} · {alert.code}</span>
              <button
                className={`text-xs font-medium hover:underline ${alert.type === 'danger' ? 'text-red-400' : 'text-yellow-400'}`}
              >
                {alert.action}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Row 2: 5个KPI指标 ===== */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard
          label="求助总数"
          value={stats?.total_requests ?? 0}
          color="text-terminal-accent"
          bg="bg-terminal-accent/5"
          border="border-terminal-accent/20"
          trend="↑142"
          trendUp
          subInfo="近10小时"
        />
        <KpiCard
          label="待处理"
          value={stats?.pending_requests ?? 0}
          color="text-red-400"
          bg="bg-red-400/5"
          border="border-red-400/20"
          trend="↑8"
          trendUp
          subInfo="新增"
        />
        <KpiCard
          label="已救援"
          value={stats?.resolved_requests ?? 0}
          color="text-green-400"
          bg="bg-green-400/5"
          border="border-green-400/20"
          subInfo="救援率89%"
        />
        <KpiCard
          label="P2P匹配"
          value={p2pMatches}
          color="text-terminal-info"
          bg="bg-terminal-info/5"
          border="border-terminal-info/20"
          subInfo={`${p2pOngoing}个进行中·${p2pTimeout}个超时`}
        />
        <KpiCard
          label="活跃志愿者"
          value={stats?.total_volunteers ?? 0}
          color="text-orange-400"
          bg="bg-orange-400/5"
          border="border-orange-400/20"
          subInfo="5支执行中·5支待命"
        />
      </div>

      {/* ===== Row 3: 灾区地图 + 实时求助动态 ===== */}
      <div className="grid grid-cols-3 gap-3">
        {/* 灾区地图 */}
        <div className="col-span-2 bg-terminal-card border border-terminal-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider">🗺 灾情态势图</h3>
            <span className="text-terminal-info text-[10px] hover:underline cursor-pointer">查看大图 →</span>
          </div>
          <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: '280px' }}>
            {/* 网格 */}
            {Array.from({ length: 6 }, (_, i) => (
              <React.Fragment key={`g-${i}`}>
                <line x1={i * 20} y1={0} x2={i * 20} y2={100} stroke="#1E1E24" strokeWidth={0.15} />
                <line x1={0} y1={i * 20} x2={100} y2={i * 20} stroke="#1E1E24" strokeWidth={0.15} />
              </React.Fragment>
            ))}
            {/* 城市位置（小圆点） */}
            {GUANGXI_CITIES.map((city) => (
              <circle
                key={`c-${city.name}`}
                cx={toSvgX(city.lng)}
                cy={toSvgY(city.lat)}
                r={0.6}
                fill="#4B5563"
              />
            ))}
            {/* 城市标签 */}
            {GUANGXI_CITIES.map((city) => (
              <text
                key={city.name}
                x={toSvgX(city.lng)}
                y={toSvgY(city.lat) - 1.5}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="1.8"
                fontWeight="500"
              >
                {city.name}
              </text>
            ))}
            {/* 灾情点（按紧急度着色） */}
            {mapPoints.map((r) => {
              const color =
                r.urgency === 'critical'
                  ? '#FF4444'
                  : r.urgency === 'high'
                    ? '#FF8800'
                    : r.urgency === 'medium'
                      ? '#FFD600'
                      : '#2979FF';
              const cx = toSvgX(r.lng || 108);
              const cy = toSvgY(r.lat || 23);
              const isCritical = r.urgency === 'critical';
              return (
                <React.Fragment key={r.id}>
                  {/* 脉冲光环（仅特大） */}
                  {isCritical && (
                    <circle cx={cx} cy={cy} r={3.5} fill={color} opacity={0.15}>
                      <animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={cx} cy={cy} r={isCritical ? 3 : 2} fill={color} opacity={0.6} />
                  <circle cx={cx} cy={cy} r={1.2} fill={color} />
                </React.Fragment>
              );
            })}
          </svg>
          <div className="flex items-center justify-center gap-4 mt-1.5 text-[9px] text-terminal-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 特大
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> 重大
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> 较大
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 一般
            </span>
          </div>
        </div>

        {/* 实时求助动态 */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider">📋 实时求助动态</h3>
            <span className="text-terminal-info text-[10px] hover:underline cursor-pointer">全部 →</span>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto terminal-scrollbar">
            {displayRequests.slice(0, 8).map((r) => {
              const level =
                r.urgency === 'critical' ? 'I级' : r.urgency === 'high' ? 'II级' : 'III级';
              const typeLabel = r.route === 'p2p' ? 'P2P互助' : '集中派单';
              const title = r.title || '未命名求助';
              const detail = r.description || '';
              const time = new Date(r.created_at).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const levelColor =
                level === 'I级' ? 'bg-red-500' : level === 'II级' ? 'bg-orange-500' : 'bg-yellow-500';
              const typeColor = typeLabel === '集中派单' ? 'text-red-400' : 'text-terminal-info';

              return (
                <div
                  key={r.id}
                  className="border-l-2 border-terminal-border pl-2.5 py-1.5 hover:bg-terminal-border/10 rounded-r transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${levelColor}`} />
                    <span className="text-terminal-muted text-[9px] truncate">{r.address || '未知位置'}</span>
                    <span className={`text-[9px] font-medium ${typeColor}`}>{typeLabel}</span>
                  </div>
                  <div className="text-terminal-text text-[10px] font-medium leading-snug mb-0.5">{title}</div>
                  <div className="text-terminal-muted text-[9px] leading-snug">{detail}</div>
                  <div className="text-terminal-muted text-[8px] mt-0.5">{time}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== Row 4: 物资供需 + 风险等级/最新公告 ===== */}
      <div className="grid grid-cols-3 gap-3">
        {/* 物资供需 */}
        <div className="col-span-2 bg-terminal-card border border-terminal-border rounded-lg p-3">
          <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-3">📦 物资供需</h3>
          {resources.length === 0 ? (
            <div className="text-terminal-muted text-[10px] py-2">暂无物资数据</div>
          ) : (
            <div className="space-y-2.5">
              {resources.slice(0, 6).map((res) => {
                const ratio = res.total_quantity > 0 ? (res.available_quantity / res.total_quantity) * 100 : 0;
                const barColor = ratio > 60 ? 'bg-green-500' : ratio > 30 ? 'bg-terminal-accent' : 'bg-red-500';
                return (
                  <div key={res.id} className="flex items-center gap-3">
                    <div className="w-20 text-terminal-text text-[10px] truncate">{res.name}</div>
                    <div className="flex-1">
                      <div className="w-full h-1.5 bg-terminal-border rounded-full">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-terminal-muted text-[10px] shrink-0 w-20 text-right">
                      {res.available_quantity}/{res.total_quantity} {res.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 风险等级 + 最新公告 */}
        <div className="space-y-3">
          {/* 风险等级 */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
            <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-2">⚠ 风险等级</h3>
            <div className={`text-3xl font-bold text-center py-1 ${riskColor}`}>{riskLevel}</div>
            <div className="flex justify-between text-[10px] text-terminal-muted mt-1">
              <span>告警: {escalations.length}条</span>
              <span>待处理: {stats?.pending_requests ?? 0}条</span>
            </div>
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
                      <div className="text-terminal-muted text-[8px]">
                        {new Date(a.published_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KPI 卡片组件
// ============================================================
function KpiCard({
  label,
  value,
  color,
  bg,
  border,
  trend,
  trendUp,
  subInfo,
}: {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  border: string;
  trend?: string;
  trendUp?: boolean;
  subInfo?: string;
}) {
  return (
    <div className={`${bg} ${border} border rounded-lg p-3`}>
      <div className="text-terminal-muted text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="flex items-center justify-between mt-1">
        {trend && (
          <span className={`text-[10px] font-medium ${trendUp ? 'text-red-400' : 'text-green-400'}`}>{trend}</span>
        )}
        {subInfo && <span className="text-terminal-muted text-[10px]">{subInfo}</span>}
      </div>
    </div>
  );
}

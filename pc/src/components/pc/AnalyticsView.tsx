'use client';

// ============================================================
// View 9: 数据分析 — 匹配效率指标 + 趋势柱状图 + 环形图 + 明细表
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { MatchStats, HelpRequest } from '@/types/models';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

// ---- SVG 环形图组件 ----
function DonutChart({ data, title, height = 180 }: {
  title: string;
  data: { label: string; value: number; color: string }[];
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 70, cy = 70, outerR = 55, innerR = 35;
  let cumulativeAngle = -Math.PI / 2;

  const slices = data.map((d) => {
    const sliceAngle = (d.value / total) * Math.PI * 2;
    const startX = cx + outerR * Math.cos(cumulativeAngle);
    const startY = cy + outerR * Math.sin(cumulativeAngle);
    cumulativeAngle += sliceAngle;
    const endX = cx + outerR * Math.cos(cumulativeAngle);
    const endY = cy + outerR * Math.sin(cumulativeAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    return {
      d: `M ${startX} ${startY} A ${outerR} ${outerR} 0 ${largeArc} 1 ${endX} ${endY} L ${cx + innerR * Math.cos(cumulativeAngle)} ${cy + innerR * Math.sin(cumulativeAngle)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${cx + innerR * Math.cos(cumulativeAngle - sliceAngle)} ${cy + innerR * Math.sin(cumulativeAngle - sliceAngle)} Z`,
      color: d.color,
      label: d.label,
      value: d.value,
      percent: ((d.value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
      <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-3">{title}</h3>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 140 140" width={height} height={height}>
          {slices.map((s, i) => (
            <path key={i} d={s.d} fill={s.color} opacity={0.85} stroke="#131316" strokeWidth={0.5}>
              <title>{s.label}: {s.value} ({s.percent}%)</title>
            </path>
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#E4E4E7" fontSize="10" fontWeight="bold">{total}</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fill="#71717A" fontSize="7">总计</text>
        </svg>
        <div className="space-y-2 flex-1">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-terminal-muted text-[10px] flex-1">{s.label}</span>
              <span className="text-terminal-text text-[11px] font-medium">{s.value}</span>
              <span className="text-terminal-muted text-[9px] w-10 text-right">{s.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- SVG 柱状图组件 ----
function BarChart({ data, title, color = '#FF8800', height = 180 }: {
  title: string;
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return <EmptyState icon="◈" title="暂无数据" />;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.max(6, Math.min(20, 300 / data.length));
  const totalW = data.length * (barW + 4) + 60;
  const chartH = height - 40;
  const chartY = 5;

  // Y轴刻度
  const yTicks = 4;
  const yStep = maxVal / yTicks;

  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
      <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${totalW} ${height}`} width={Math.max(totalW, 200)} height={height} className="mx-auto">
          {/* Y 轴 */}
          <line x1={30} y1={chartY} x2={30} y2={chartY + chartH} stroke="#1E1E24" strokeWidth={0.5} />
          <line x1={30} y1={chartY + chartH} x2={totalW - 10} y2={chartY + chartH} stroke="#1E1E24" strokeWidth={0.5} />
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const y = chartY + chartH - (i / yTicks) * chartH;
            return (
              <React.Fragment key={`y-${i}`}>
                <line x1={27} y1={y} x2={30} y2={y} stroke="#1E1E24" strokeWidth={0.5} />
                <text x={25} y={y + 3} textAnchor="end" fill="#71717A" fontSize="6">{(yStep * i).toFixed(1)}</text>
              </React.Fragment>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const barH = (d.value / maxVal) * chartH;
            const x = 40 + i * (barW + 4);
            const y = chartY + chartH - barH;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH} fill={color} opacity={0.7} rx={1}>
                  <title>{d.label}: {d.value}</title>
                </rect>
                <text x={x + barW / 2} y={chartY + chartH + 12} textAnchor="middle" fill="#71717A" fontSize="5" transform={`rotate(-30, ${x + barW / 2}, ${chartY + chartH + 12})`}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function AnalyticsView() {
  const [stats, setStats] = useState<MatchStats[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const [s, mapData] = await Promise.all([
          dashboardApi.getMatchStats({ start_date: startDate, end_date: endDate }),
          dashboardApi.getMapData(),
        ]);
        setStats(s);
        setRequests(mapData.requests);
      } catch (err) {
        console.error('Load stats error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 计算汇总
  const totalMatches = stats.reduce((sum, s) => sum + s.total_matches, 0);
  const avgCoverage = stats.length > 0 ? stats.reduce((sum, s) => sum + s.p2p_coverage_rate, 0) / stats.length : 0;
  const avgEscalation = stats.length > 0 ? stats.reduce((sum, s) => sum + s.escalation_rate, 0) / stats.length : 0;
  const avgMatchTime = stats.length > 0 ? stats.reduce((sum, s) => sum + s.avg_match_time_sec, 0) / stats.length : 0;

  // 紧急度分布（用于环形图）
  const urgencyDist = [
    { label: 'I级特大', value: requests.filter((r) => r.urgency === 'critical').length, color: '#FF4444' },
    { label: 'II级重大', value: requests.filter((r) => r.urgency === 'high').length, color: '#FF8800' },
    { label: 'III级较大', value: requests.filter((r) => r.urgency === 'medium').length, color: '#FFD600' },
    { label: 'IV级一般', value: requests.filter((r) => r.urgency === 'low').length, color: '#2979FF' },
  ];

  // 路由分布环形图数据
  const routeDist = [
    { label: 'P2P直连', value: requests.filter((r) => r.route === 'p2p').length, color: '#00C853' },
    { label: '中心调度', value: requests.filter((r) => r.route === 'centralized').length, color: '#FF8800' },
  ];

  // 状态分布
  const statusDist = [
    { label: '待处理', value: requests.filter((r) => r.status === 'pending').length, color: '#FF4444' },
    { label: '处理中', value: requests.filter((r) => r.status === 'processing').length, color: '#FF8800' },
    { label: '已解决', value: requests.filter((r) => r.status === 'resolved').length, color: '#00C853' },
    { label: '已取消', value: requests.filter((r) => r.status === 'cancelled').length, color: '#71717A' },
  ];

  // 柱状图数据
  const barData = stats.map((s) => ({ label: s.date.slice(5), value: s.total_matches }));

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* KPI */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <KpiBox label="总匹配数" value={totalMatches} color="text-terminal-accent" />
        <KpiBox label="P2P覆盖率" value={`${avgCoverage.toFixed(1)}%`} color="text-green-400" />
        <KpiBox label="升级率" value={`${avgEscalation.toFixed(1)}%`} color="text-red-400" />
        <KpiBox label="平均匹配耗时" value={`${avgMatchTime.toFixed(0)}s`} color="text-blue-400" />
        <KpiBox
          label="统计范围"
          value={stats.length > 0 ? `${stats[0].date} ~ ${stats[stats.length-1].date}` : '-'}
          color="text-terminal-muted" small
        />
      </div>

      {/* Row 1: 柱状图 + 效率表格 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* SVG 柱状图 */}
        <BarChart title="每日匹配数量趋势" data={barData} color="#FF8800" height={220} />

        {/* 环形图：紧急度分布 */}
        <DonutChart title="求助紧急度分布" data={urgencyDist} height={190} />
      </div>

      {/* Row 2: 两个环形图 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <DonutChart title="路由模式分布" data={routeDist} height={190} />
        <DonutChart title="求助状态分布" data={statusDist} height={190} />
      </div>

      {/* Row 3: 效率指标明细表 */}
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
        <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-4">效率指标明细</h3>
        {stats.length === 0 ? (
          <EmptyState icon="◈" title="暂无统计数据" />
        ) : (
          <div className="overflow-auto max-h-[240px] terminal-scrollbar">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-terminal-muted border-b border-terminal-border sticky top-0 bg-terminal-card">
                  <th className="text-left py-1.5 font-medium">日期</th>
                  <th className="text-right py-1.5 font-medium">总数</th>
                  <th className="text-right py-1.5 font-medium">P2P覆盖</th>
                  <th className="text-right py-1.5 font-medium">升级率</th>
                  <th className="text-right py-1.5 font-medium">失联率</th>
                  <th className="text-right py-1.5 font-medium">接力率</th>
                  <th className="text-right py-1.5 font-medium">协作率</th>
                  <th className="text-right py-1.5 font-medium">平均耗时</th>
                </tr>
              </thead>
              <tbody>
                {stats.slice(-30).reverse().map((s) => (
                  <tr key={s.date} className="border-b border-terminal-border/50 hover:bg-terminal-border/20">
                    <td className="py-1.5 text-terminal-muted font-mono">{s.date.slice(5)}</td>
                    <td className="py-1.5 text-right text-terminal-text font-medium">{s.total_matches}</td>
                    <td className={`py-1.5 text-right ${s.p2p_coverage_rate > 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {s.p2p_coverage_rate.toFixed(1)}%
                    </td>
                    <td className={`py-1.5 text-right ${s.escalation_rate > 20 ? 'text-red-400' : 'text-terminal-text'}`}>
                      {s.escalation_rate.toFixed(1)}%
                    </td>
                    <td className={`py-1.5 text-right ${s.unreachable_rate > 5 ? 'text-red-400' : 'text-terminal-text'}`}>
                      {s.unreachable_rate.toFixed(1)}%
                    </td>
                    <td className="py-1.5 text-right text-terminal-text">{s.relay_rate.toFixed(1)}%</td>
                    <td className="py-1.5 text-right text-terminal-text">{s.cooperative_rate.toFixed(1)}%</td>
                    <td className="py-1.5 text-right text-terminal-text">{s.avg_match_time_sec.toFixed(0)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiBox({ label, value, color, small }: { label: string; value: string | number; color: string; small?: boolean }) {
  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
      <div className={`${small ? 'text-sm' : 'text-lg'} font-bold ${color}`}>{value}</div>
      <div className="text-terminal-muted text-[10px] uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

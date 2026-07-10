'use client';

// ============================================================
// View 9: 数据分析 — 匹配效率指标 + 趋势图 + 区域环形图
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { MatchStats } from '@/types/models';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

export function AnalyticsView() {
  const [stats, setStats] = useState<MatchStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const s = await dashboardApi.getMatchStats({ start_date: startDate, end_date: endDate });
        setStats(s);
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

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* KPI */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <KpiBox label="总匹配数" value={totalMatches} color="text-terminal-accent" />
        <KpiBox label="P2P覆盖率" value={`${avgCoverage.toFixed(1)}%`} color="text-green-400" />
        <KpiBox label="升级率" value={`${avgEscalation.toFixed(1)}%`} color="text-red-400" />
        <KpiBox
          label="平均匹配耗时"
          value={`${stats.length > 0 ? (stats.reduce((sum, s) => sum + s.avg_match_time_sec, 0) / stats.length).toFixed(0) : 0}s`}
          color="text-blue-400"
        />
        <KpiBox
          label="日期范围"
          value={stats.length > 0 ? `${stats[0].date} ~ ${stats[stats.length-1].date}` : '-'}
          color="text-terminal-muted"
          small
        />
      </div>

      {/* Trend Chart (text-based bar chart) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-4">每日匹配数量趋势</h3>
          {stats.length === 0 ? (
            <EmptyState icon="◈" title="暂无统计数据" />
          ) : (
            <div className="flex items-end gap-1 h-[200px]">
              {stats.map((s) => {
                const maxVal = Math.max(...stats.map((x) => x.total_matches), 1);
                const height = (s.total_matches / maxVal) * 100;
                return (
                  <div key={s.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-terminal-accent/60 hover:bg-terminal-accent rounded-t transition-colors"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-terminal-muted text-[8px] rotate-45 origin-left whitespace-nowrap">
                      {s.date.slice(5)}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-terminal-bg border border-terminal-border rounded px-2 py-1 z-10">
                      <div className="text-terminal-text text-[10px] whitespace-nowrap">
                        {s.date}: {s.total_matches} 匹配
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Efficiency Metrics Table */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
          <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-4">效率指标明细</h3>
          {stats.length === 0 ? (
            <EmptyState icon="◈" title="暂无统计数据" />
          ) : (
            <div className="overflow-auto max-h-[200px] terminal-scrollbar">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-terminal-muted border-b border-terminal-border">
                    <th className="text-left py-1.5 font-medium">日期</th>
                    <th className="text-right py-1.5 font-medium">总数</th>
                    <th className="text-right py-1.5 font-medium">P2P覆盖</th>
                    <th className="text-right py-1.5 font-medium">升级率</th>
                    <th className="text-right py-1.5 font-medium">失联率</th>
                    <th className="text-right py-1.5 font-medium">接力率</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.slice(-15).reverse().map((s) => (
                    <tr key={s.date} className="border-b border-terminal-border/50 hover:bg-terminal-border/20">
                      <td className="py-1.5 text-terminal-muted font-mono">{s.date.slice(5)}</td>
                      <td className="py-1.5 text-right text-terminal-text">{s.total_matches}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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

'use client';

// ============================================================
// View 3: 匹配监控 — 实时流 + waiting/unreachable 告警
// ============================================================

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { matchApi } from '@/api';
import type { Match } from '@/types/models';
import { MatchStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

/** 兼容后端 JSON 字段命名：status / accept_time / complete_time */
function getMatchStatus(m: Match): string {
  return m.status ?? m.match_status ?? '';
}
function getAcceptTime(m: Match): string | undefined {
  return m.accept_time ?? m.accepted_at;
}
function getCompleteTime(m: Match): string | undefined {
  return m.complete_time ?? m.completed_at;
}

export function MatchMonitorView() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const isFirstLoad = useRef(true);

  const load = useCallback(async () => {
    if (isFirstLoad.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const param: Record<string, unknown> = { page_size: 50 };
      if (filter) param.status = filter;
      const res = await matchApi.list(param as any);
      setMatches(res.items);
    } catch (err: any) {
      console.error('Load matches error:', err);
      if (err?.response?.status !== 401) {
        setError('数据加载失败，请稍后重试');
      }
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  }, [filter]);

  useEffect(() => {
    isFirstLoad.current = true;
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const waitingCount = matches.filter((m) => getMatchStatus(m) === 'waiting').length;
  const unreachableCount = matches.filter((m) => getMatchStatus(m) === 'unreachable').length;
  const escalatedCount = matches.filter((m) => getMatchStatus(m) === 'escalated').length;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* Alert Cards for problem matches */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <AlertCard label="受阻等待" count={waitingCount} color="text-yellow-400" bg="border-yellow-400/20 bg-yellow-400/5" />
        <AlertCard label="失联" count={unreachableCount} color="text-red-400" bg="border-red-400/20 bg-red-400/5" />
        <AlertCard label="已升级" count={escalatedCount} color="text-purple-400" bg="border-purple-400/20 bg-purple-400/5" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-terminal-bg border border-terminal-border rounded px-2 py-1.5 text-terminal-text text-xs outline-none focus:border-terminal-accent"
        >
          <option value="">全部状态</option>
          <option value="pending">待响应</option>
          <option value="accepted">已接受</option>
          <option value="enroute">前往中</option>
          <option value="waiting">受阻等待</option>
          <option value="unreachable">失联</option>
          <option value="completed">已完成</option>
          <option value="rejected">已拒绝</option>
          <option value="timeout">已超时</option>
          <option value="escalated">已升级</option>
        </select>
        <span className="text-terminal-muted text-xs">{matches.length} 条匹配</span>
      </div>

      {loading ? (
        <LoadingSpinner className="mt-10" />
      ) : error ? (
        <EmptyState icon="⚡" title={error} />
      ) : matches.length === 0 ? (
        <EmptyState icon="⚡" title="暂无匹配记录" />
      ) : (
        <div className="space-y-2">
          {matches.map((m) => {
            const ms = getMatchStatus(m);
            const acceptT = getAcceptTime(m);
            const completeT = getCompleteTime(m);
            return (
              <div
                key={m.id}
                className={`bg-terminal-card border rounded-lg p-3 flex items-center gap-4 transition-colors
                  ${ms === 'unreachable' || ms === 'escalated' ? 'border-red-400/30' : 'border-terminal-border'}
                  ${ms === 'waiting' ? 'border-yellow-400/30' : ''}
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MatchStatusBadge status={ms} />
                    {m.is_cooperative && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 rounded">协办</span>}
                    {m.relay_hop !== undefined && m.relay_hop > 0 && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 rounded">接力 H{m.relay_hop}</span>
                    )}
                  </div>
                  <div className="text-terminal-text text-sm font-medium truncate">
                    匹配 #{m.id.slice(0, 8)}
                  </div>
                  <div className="text-terminal-muted text-[11px] mt-0.5">
                    半径: {m.match_radius_used || '-'}km ·
                    {acceptT ? ` 接单: ${new Date(acceptT).toLocaleTimeString('zh-CN')}` : ''}
                    {completeT ? ` 完成: ${new Date(completeT).toLocaleTimeString('zh-CN')}` : ''}
                  </div>
                  {m.waiting_reason && (
                    <div className="text-yellow-400 text-[11px] mt-0.5">
                      ⚠ {m.waiting_reason}{m.waiting_eta_min ? ` (预计 ${m.waiting_eta_min} 分钟)` : ''}
                    </div>
                  )}
                  {m.unreachable_detected_at && (
                    <div className="text-red-400 text-[11px] mt-0.5">
                      🚫 失联检测: {new Date(m.unreachable_detected_at).toLocaleTimeString('zh-CN')}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-terminal-text text-sm font-mono">{m.match_score ?? '-'}</div>
                  <div className="text-terminal-muted text-[10px]">匹配分</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AlertCard({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className={`border rounded-lg p-3 ${bg}`}>
      <div className={`text-lg font-bold ${color}`}>{count}</div>
      <div className="text-terminal-muted text-xs mt-0.5">{label}</div>
    </div>
  );
}

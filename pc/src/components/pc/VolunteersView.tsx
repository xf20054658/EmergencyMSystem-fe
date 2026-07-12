'use client';

// ============================================================
// View 7: 志愿者管理 — Tier 筛选 + 信任分/技能/评分 + 冻结状态
// ============================================================

import React, { useEffect, useState } from 'react';
import { volunteerApi } from '@/api';
import type { Volunteer } from '@/types/models';
import { TierBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';
import { MOCK_VOLUNTEERS } from '@/mock/data';

export function VolunteersView() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ tier?: string; frozen?: string }>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page_size: 100 };
        if (filters.tier) params.tier = filters.tier;
        if (filters.frozen !== undefined) params.frozen = filters.frozen === 'true';
        const res = await volunteerApi.list(params as any);
        setVolunteers(res.items && res.items.length > 0 ? res.items : MOCK_VOLUNTEERS);
      } catch (err) {
        console.error('Load volunteers error:', err);
        setVolunteers(MOCK_VOLUNTEERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={filters.tier || ''}
          onChange={(e) => setFilters((f) => ({ ...f, tier: e.target.value || undefined }))}
          className="bg-terminal-bg border border-terminal-border rounded px-2 py-1.5 text-terminal-text text-xs outline-none"
        >
          <option value="">全部等级</option>
          <option value="tier1">认证救援队</option>
          <option value="tier2">认证志愿者</option>
          <option value="tier3">普通市民</option>
        </select>
        <select
          value={filters.frozen || ''}
          onChange={(e) => setFilters((f) => ({ ...f, frozen: e.target.value || undefined }))}
          className="bg-terminal-bg border border-terminal-border rounded px-2 py-1.5 text-terminal-text text-xs outline-none"
        >
          <option value="">全部状态</option>
          <option value="false">正常</option>
          <option value="true">冻结中</option>
        </select>
        <span className="text-terminal-muted text-xs">{volunteers.length} 名志愿者</span>
      </div>

      {loading ? (
        <LoadingSpinner className="mt-10" />
      ) : volunteers.length === 0 ? (
        <EmptyState icon="♜" title="暂无志愿者" />
      ) : (
        <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-terminal-border text-terminal-muted">
                  <th className="text-left px-4 py-2.5 font-medium">姓名</th>
                  <th className="text-left px-4 py-2.5 font-medium">等级</th>
                  <th className="text-left px-4 py-2.5 font-medium">信任分</th>
                  <th className="text-left px-4 py-2.5 font-medium">技能</th>
                  <th className="text-left px-4 py-2.5 font-medium">放弃率</th>
                  <th className="text-left px-4 py-2.5 font-medium">认证</th>
                  <th className="text-left px-4 py-2.5 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => {
                  const isFrozen = v.frozen_until && new Date(v.frozen_until) > new Date();
                  return (
                    <tr key={v.id} className={`border-b border-terminal-border hover:bg-terminal-border/20 ${isFrozen ? 'bg-red-500/5' : ''}`}>
                      <td className="px-4 py-2.5 text-terminal-text font-medium">{v.real_name_masked || v.real_name || v.user?.name || '-'}</td>
                      <td className="px-4 py-2.5"><TierBadge tier={v.tier} /></td>
                      <td className="px-4 py-2.5">
                        <span className={`font-mono font-bold ${v.trust_score >= 90 ? 'text-green-400' : v.trust_score >= 60 ? 'text-terminal-accent' : 'text-red-400'}`}>
                          {v.trust_score}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-terminal-text max-w-[150px] truncate">
                        {v.skills?.map((s) => s.skill_type).join(', ') || '-'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={v.abandon_rate && v.abandon_rate > 30 ? 'text-red-400' : 'text-terminal-text'}>
                          {v.abandon_rate?.toFixed(1) || '0'}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {v.is_certified ? (
                          <span className="text-green-400">✓ {v.certification_type || ''}</span>
                        ) : (
                          <span className="text-terminal-muted">未认证</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {isFrozen ? (
                          <span className="text-red-400" title={`冻结至: ${v.frozen_until} (${v.frozen_reason || ''})`}>
                            🚫 冻结
                          </span>
                        ) : (
                          <span className="text-green-400">正常</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

// ============================================================
// View 2: 求助管理 — 多维筛选表格 + 路由徽章
// ============================================================

import React, { useEffect, useState } from 'react';
import { helpRequestApi } from '@/api';
import type { HelpRequest } from '@/types/models';
import { UrgencyBadge, RequestStatusBadge, RouteBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';
import { VUL_GROUP_LABELS } from '@/lib/constants';

export function HelpRequestsView() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ urgency?: string; status?: string; route?: string; keyword?: string }>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await helpRequestApi.list({ ...filters, page_size: 50 });
        setRequests(res.items);
        setTotal(res.total);
      } catch (err) {
        console.error('Load requests error:', err);
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
        <input
          type="text"
          placeholder="搜索标题、地址..."
          value={filters.keyword || ''}
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value || undefined }))}
          className="bg-terminal-bg border border-terminal-border rounded px-3 py-1.5 text-terminal-text text-xs w-48 focus:border-terminal-accent outline-none"
        />
        <SelectFilter
          value={filters.urgency || ''}
          onChange={(v) => setFilters((f) => ({ ...f, urgency: v || undefined }))}
          options={[
            { value: '', label: '全部等级' },
            { value: 'critical', label: 'I级 特大' },
            { value: 'high', label: 'II级 重大' },
            { value: 'medium', label: 'III级 较大' },
            { value: 'low', label: 'IV级 一般' },
          ]}
        />
        <SelectFilter
          value={filters.status || ''}
          onChange={(v) => setFilters((f) => ({ ...f, status: v || undefined }))}
          options={[
            { value: '', label: '全部状态' },
            { value: 'pending', label: '待处理' },
            { value: 'processing', label: '处理中' },
            { value: 'resolved', label: '已解决' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
        <SelectFilter
          value={filters.route || ''}
          onChange={(v) => setFilters((f) => ({ ...f, route: v || undefined }))}
          options={[
            { value: '', label: '全部路由' },
            { value: 'centralized', label: '集中派单' },
            { value: 'p2p', label: 'P2P互助' },
          ]}
        />
        <span className="text-terminal-muted text-xs ml-auto">{total} 条记录</span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner className="mt-10" />
      ) : requests.length === 0 ? (
        <EmptyState icon="📋" title="暂无求助记录" description="当前筛选条件下无匹配结果" />
      ) : (
        <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-terminal-border text-terminal-muted">
                  <th className="text-left px-4 py-2.5 font-medium">编号</th>
                  <th className="text-left px-4 py-2.5 font-medium">标题</th>
                  <th className="text-left px-4 py-2.5 font-medium">等级</th>
                  <th className="text-left px-4 py-2.5 font-medium">路由</th>
                  <th className="text-left px-4 py-2.5 font-medium">状态</th>
                  <th className="text-left px-4 py-2.5 font-medium">地址</th>
                  <th className="text-left px-4 py-2.5 font-medium">人数</th>
                  <th className="text-left px-4 py-2.5 font-medium">特殊群体</th>
                  <th className="text-left px-4 py-2.5 font-medium">代报</th>
                  <th className="text-left px-4 py-2.5 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-terminal-border hover:bg-terminal-border/20 transition-colors">
                    <td className="px-4 py-2.5 text-terminal-muted font-mono text-[11px]">{r.request_no}</td>
                    <td className="px-4 py-2.5 text-terminal-text max-w-[180px] truncate">{r.title}</td>
                    <td className="px-4 py-2.5"><UrgencyBadge level={r.urgency} /></td>
                    <td className="px-4 py-2.5"><RouteBadge route={r.route} /></td>
                    <td className="px-4 py-2.5"><RequestStatusBadge status={r.status} /></td>
                    <td className="px-4 py-2.5 text-terminal-text max-w-[150px] truncate">{r.address || '-'}</td>
                    <td className="px-4 py-2.5 text-terminal-text">{r.people_count || '-'}</td>
                    <td className="px-4 py-2.5">
                      {r.vulnerable_groups && r.vulnerable_groups.length > 0 ? (
                        <span className="text-yellow-400">{r.vulnerable_groups.map((g) => VUL_GROUP_LABELS[g] || g).join(', ')}</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.is_proxy ? <span className="text-purple-400">是</span> : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-terminal-muted whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectFilter({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-terminal-bg border border-terminal-border rounded px-2 py-1.5 text-terminal-text text-xs outline-none focus:border-terminal-accent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

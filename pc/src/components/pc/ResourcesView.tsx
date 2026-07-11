'use client';

// ============================================================
// View 5: 物资调度 — 8 类物资供需 + 物流批次状态追踪
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { Resource, ResourceBatch } from '@/types/models';
import { BatchStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

const RESOURCE_ICONS: Record<string, string> = {
  food: '🍚',
  water: '💧',
  medicine: '💊',
  tent: '⛺',
  blanket: '🛏️',
  clothing: '👕',
  fuel: '⛽',
  power: '🔋',
};

export function ResourcesView() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [batches, setBatches] = useState<ResourceBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchFilter, setBatchFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [res, bat] = await Promise.all([
          dashboardApi.getResources(),
          dashboardApi.getResourceBatches(batchFilter ? { status: batchFilter } : undefined),
        ]);
        setResources(res);
        setBatches(bat.items);
      } catch (err) {
        console.error('Load resources error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [batchFilter]);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* Resource Cards */}
      <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-3">物资库存</h3>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {resources.length === 0 ? (
          <div className="col-span-4"><EmptyState icon="📦" title="暂无物资数据" /></div>
        ) : (
          resources.map((r) => (
            <div key={r.id} className="bg-terminal-card border border-terminal-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{RESOURCE_ICONS[r.type] || '📦'}</span>
                <span className="text-terminal-text text-sm font-medium">{r.name}</span>
              </div>
              <div className="text-terminal-muted text-[10px] uppercase mb-1">{r.type}</div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-terminal-accent text-lg font-bold">{r.available_quantity}</span>
                  <span className="text-terminal-muted text-xs">/{r.total_quantity} {r.unit}</span>
                </div>
                <div className="text-terminal-muted text-[10px]">
                  {r.total_quantity > 0 ? `${((r.available_quantity / r.total_quantity) * 100).toFixed(0)}%` : '0%'}
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1 bg-terminal-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-terminal-accent rounded-full transition-all"
                  style={{ width: `${r.total_quantity > 0 ? (r.available_quantity / r.total_quantity) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Logistics Batches */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider">物流批次</h3>
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-terminal-text text-xs outline-none"
        >
          <option value="">全部状态</option>
          <option value="preparing">备货中</option>
          <option value="in_transit">运输中</option>
          <option value="arrived">已到达</option>
          <option value="distributing">分发中</option>
          <option value="distributed">已分发</option>
          <option value="recalled">已召回</option>
          <option value="expired">已过期</option>
        </select>
      </div>

      {batches.length === 0 ? (
        <EmptyState icon="🚚" title="暂无物流批次" />
      ) : (
        <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-terminal-border text-terminal-muted">
                  <th className="text-left px-4 py-2.5 font-medium">批次号</th>
                  <th className="text-left px-4 py-2.5 font-medium">物资</th>
                  <th className="text-left px-4 py-2.5 font-medium">数量</th>
                  <th className="text-left px-4 py-2.5 font-medium">状态</th>
                  <th className="text-left px-4 py-2.5 font-medium">承运</th>
                  <th className="text-left px-4 py-2.5 font-medium">预计到达</th>
                  <th className="text-left px-4 py-2.5 font-medium">实际到达</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-b border-terminal-border hover:bg-terminal-border/20">
                    <td className="px-4 py-2.5 text-terminal-muted font-mono text-[11px]">{b.batch_no}</td>
                    <td className="px-4 py-2.5 text-terminal-text">{b.resource?.name || '-'}</td>
                    <td className="px-4 py-2.5 text-terminal-text">{b.quantity}</td>
                    <td className="px-4 py-2.5"><BatchStatusBadge status={b.status} /></td>
                    <td className="px-4 py-2.5 text-terminal-text">{b.carrier || '-'}</td>
                    <td className="px-4 py-2.5 text-terminal-muted whitespace-nowrap">
                      {b.estimated_arrival ? new Date(b.estimated_arrival).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-terminal-muted whitespace-nowrap">
                      {b.actual_arrival ? new Date(b.actual_arrival).toLocaleString('zh-CN') : '-'}
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

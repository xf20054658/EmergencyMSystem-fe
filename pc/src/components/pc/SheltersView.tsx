'use client';

// ============================================================
// View 8: 安置点 — 容量/入住率/状态
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { Shelter } from '@/types/models';
import { ShelterStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';
import { MOCK_SHELTERS } from '@/mock/data';

export function SheltersView() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await dashboardApi.getMapData();
        setShelters(data.shelters && data.shelters.length > 0 ? data.shelters : MOCK_SHELTERS);
      } catch (err) {
        console.error('Load shelters error:', err);
        setShelters(MOCK_SHELTERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupancy = shelters.reduce((sum, s) => sum + s.current_occupancy, 0);

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
          <div className="text-terminal-accent text-lg font-bold">{shelters.length}</div>
          <div className="text-terminal-muted text-xs">安置点总数</div>
        </div>
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
          <div className="text-blue-400 text-lg font-bold">{totalCapacity}</div>
          <div className="text-terminal-muted text-xs">总容量 (人)</div>
        </div>
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
          <div className={`text-lg font-bold ${totalOccupancy / totalCapacity > 0.8 ? 'text-red-400' : 'text-green-400'}`}>
            {totalCapacity > 0 ? ((totalOccupancy / totalCapacity) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-terminal-muted text-xs">总入住率 ({totalOccupancy}人)</div>
        </div>
      </div>

      {shelters.length === 0 ? (
        <EmptyState icon="⌂" title="暂无安置点数据" />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {shelters.map((s) => {
            const occupancyRate = s.capacity > 0 ? (s.current_occupancy / s.capacity) * 100 : 0;
            const isHigh = occupancyRate > 80;
            return (
              <div key={s.id} className="bg-terminal-card border border-terminal-border rounded-lg p-4 hover:border-terminal-accent/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-terminal-text font-semibold text-sm">{s.name}</div>
                  <ShelterStatusBadge status={s.status} />
                </div>
                <div className="space-y-2">
                  <div className="text-terminal-muted text-[11px] truncate">{s.address}</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-terminal-muted">容量</span>
                    <span className={`font-mono ${isHigh ? 'text-red-400' : 'text-terminal-text'}`}>
                      {s.current_occupancy} / {s.capacity}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-terminal-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isHigh ? 'bg-red-500' : occupancyRate > 50 ? 'bg-terminal-accent' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] text-terminal-muted">{occupancyRate.toFixed(0)}% 入住率</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

// ============================================================
// Mobile 避难所 — 安置点列表
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { Shelter } from '@/types/models';
import { ShelterStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

export function MobileSheltersView() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await dashboardApi.getMapData();
        setShelters(data.shelters);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-4 pb-24 space-y-4">
      <h1 className="text-ios-text text-xl font-bold pt-2">避难所</h1>

      {shelters.length === 0 ? (
        <EmptyState icon="🏠" title="暂无安置点数据" />
      ) : (
        <div className="space-y-3">
          {shelters.map((s) => {
            const occupancyRate = s.capacity > 0 ? (s.current_occupancy / s.capacity) * 100 : 0;
            return (
              <div key={s.id} className="ios-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-ios-text text-sm font-semibold">{s.name}</div>
                    <div className="text-ios-muted text-xs mt-0.5">{s.address}</div>
                  </div>
                  <ShelterStatusBadge status={s.status} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-ios-muted text-xs">
                    入住 <span className={`font-bold ${occupancyRate > 80 ? 'text-red-500' : 'text-ios-green'}`}>{s.current_occupancy}</span> / {s.capacity} 人
                  </span>
                  <span className="text-ios-muted text-xs">{occupancyRate.toFixed(0)}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-ios-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${occupancyRate > 80 ? 'bg-red-500' : occupancyRate > 50 ? 'bg-ios-orange' : 'bg-ios-green'}`}
                    style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                  />
                </div>
                {s.contact_phone && (
                  <div className="mt-3 flex items-center gap-2 text-ios-blue text-sm">
                    <span>📞</span>
                    <a href={`tel:${s.contact_phone}`}>{s.contact_phone}</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

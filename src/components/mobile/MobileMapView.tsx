'use client';

// ============================================================
// Mobile 灾情地图 — 地图 + 求助列表
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { HelpRequest, Shelter } from '@/types/models';
import { UrgencyBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export function MobileMapView() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await dashboardApi.getMapData();
        setRequests(data.requests);
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
      <h1 className="text-ios-text text-xl font-bold pt-2">灾情地图</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-red-500 text-lg font-bold">{requests.filter((r) => r.status !== 'resolved').length}</div>
          <div className="text-red-400 text-[10px]">活跃求助</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-green-600 text-lg font-bold">{shelters.length}</div>
          <div className="text-green-500 text-[10px]">安置点</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-blue-500 text-lg font-bold">{requests.filter((r) => r.status === 'resolved').length}</div>
          <div className="text-blue-400 text-[10px]">已解决</div>
        </div>
      </div>

      {/* Help Request List (simplified map view) */}
      <div className="space-y-2">
        <h3 className="text-ios-text text-sm font-semibold">附近求助</h3>
        {requests.length === 0 ? (
          <div className="ios-card text-center text-ios-muted text-sm py-8">暂无求助信息</div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="ios-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-ios-text text-sm font-medium truncate">{r.title}</div>
                  <div className="text-ios-muted text-xs mt-0.5">{r.address || '位置未提供'}</div>
                </div>
                <UrgencyBadge level={r.urgency} />
              </div>
              <div className="flex items-center gap-3 text-xs text-ios-muted">
                <span>{r.people_count ? `${r.people_count}人` : ''}</span>
                <span>{r.is_proxy ? '代报' : ''}</span>
                <span className="ml-auto">{new Date(r.created_at).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

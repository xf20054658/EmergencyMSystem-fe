'use client';

// ============================================================
// Mobile 我的上报 — 我的求助列表
// ============================================================

import React, { useEffect, useState } from 'react';
import { helpRequestApi } from '@/api';
import type { HelpRequest } from '@/types/models';
import { UrgencyBadge, RequestStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

export function MobileMyReportsView() {
  const [reports, setReports] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await helpRequestApi.list({ page_size: 50 });
        setReports(res.items);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-4 pb-24 space-y-4">
      <h1 className="text-ios-text text-xl font-bold pt-2">我的上报</h1>

      {reports.length === 0 ? (
        <EmptyState icon="📋" title="暂无上报记录" description="您还没有提交过求助" />
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="ios-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <RequestStatusBadge status={r.status} />
                    <UrgencyBadge level={r.urgency} />
                    {r.is_proxy && <span className="text-[10px] bg-purple-100 text-purple-500 px-1.5 rounded-full">代报</span>}
                  </div>
                  <div className="text-ios-text text-sm font-medium">{r.title}</div>
                  <div className="text-ios-muted text-xs mt-1">
                    {r.request_no} · {new Date(r.created_at).toLocaleString('zh-CN')}
                  </div>
                  {r.address && <div className="text-ios-muted text-xs mt-0.5">{r.address}</div>}
                </div>
              </div>
              {r.vulnerable_groups && r.vulnerable_groups.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {r.vulnerable_groups.map((g) => (
                    <span key={g} className="text-[10px] bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full">老人</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

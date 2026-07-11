'use client';

// ============================================================
// Mobile 首页 — SOS + 快捷功能 + 实时动态
// ============================================================

import React, { useEffect, useState } from 'react';
import { SOSButton } from './SOSButton';
import { sosApi, dashboardApi } from '@/api';
import type { Announcement, RescueUpdate } from '@/types/models';
import { AlertLevelBadge } from '@/components/shared/StatusBadge';

export function MobileHomeView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [updates, setUpdates] = useState<RescueUpdate[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [a, u] = await Promise.all([
          dashboardApi.getAnnouncements(),
          dashboardApi.getRescueUpdates(),
        ]);
        setAnnouncements(a);
        setUpdates(u.slice(0, 5));
      } catch {}
    }
    load();
  }, []);

  const handleSOSConfirm = async (lat: number, lng: number) => {
    try {
      await sosApi.trigger({ lat, lng, location_source: 'gps' });
      alert('求助已发出，救援力量正在响应');
    } catch {
      alert('求助发送失败，请重试');
    }
  };

  return (
    <div className="p-4 pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-ios-text text-2xl font-bold">应急互助</h1>
          <p className="text-ios-muted text-sm">广西洪涝灾害应急管理平台</p>
        </div>
        <div className="w-10 h-10 bg-ios-blue/10 rounded-full flex items-center justify-center text-ios-blue">
          🔔
        </div>
      </div>

      {/* SOS Area */}
      <div className="flex flex-col items-center py-6">
        <SOSButton onConfirm={handleSOSConfirm} />
        <p className="text-ios-muted text-xs mt-3">长按 1.5 秒发起紧急求助</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <QuickAction icon="📋" label="求助上报" color="bg-red-50 text-red-500" />
        <QuickAction icon="🤝" label="我要帮忙" color="bg-blue-50 text-blue-500" />
        <QuickAction icon="🗺️" label="灾情地图" color="bg-green-50 text-green-600" />
        <QuickAction icon="🏠" label="避难所" color="bg-orange-50 text-orange-500" />
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="ios-card">
          <h3 className="text-ios-text text-sm font-semibold mb-3">📢 最新公告</h3>
          <div className="space-y-2">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-start gap-2">
                <AlertLevelBadge level={a.level} className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-ios-text text-sm">{a.title}</div>
                  <div className="text-ios-muted text-xs mt-0.5">{new Date(a.published_at).toLocaleString('zh-CN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rescue Updates */}
      <div className="ios-card">
        <h3 className="text-ios-text text-sm font-semibold mb-3">⏱ 救援动态</h3>
        <div className="space-y-3">
          {updates.length === 0 ? (
            <p className="text-ios-muted text-xs">暂无动态</p>
          ) : (
            updates.map((u, i) => (
              <div key={u.id || i} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-ios-blue mt-1.5" />
                  {i < updates.length - 1 && <div className="w-px flex-1 bg-ios-separator my-0.5" />}
                </div>
                <div className="flex-1">
                  <div className="text-ios-text text-sm">{u.content}</div>
                  <div className="text-ios-muted text-xs mt-0.5">{new Date(u.created_at).toLocaleTimeString('zh-CN')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <button className={`flex flex-col items-center gap-1.5 py-3 rounded-xl ${color} bg-opacity-10 transition-transform active:scale-95`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

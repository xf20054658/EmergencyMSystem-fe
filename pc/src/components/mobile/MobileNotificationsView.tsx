'use client';

// ============================================================
// Mobile 通知中心 — 通知列表 + 偏好设置
// ============================================================

import React, { useEffect, useState } from 'react';
import { notificationApi } from '@/api';
import type { Notification, NotificationPreference } from '@/types/models';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

export function MobileNotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [notifs, prefs] = await Promise.all([
          notificationApi.list(unreadOnly ? { unread_only: true, page_size: 50 } : { page_size: 50 }),
          notificationApi.getPreferences(),
        ]);
        setNotifications(notifs.items);
        setPreferences(prefs);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {}
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-ios-text text-xl font-bold">通知中心</h1>
        <button
          onClick={() => setUnreadOnly(!unreadOnly)}
          className={`text-sm ${unreadOnly ? 'text-ios-blue' : 'text-ios-muted'}`}
        >
          {unreadOnly ? '仅未读' : '全部'}
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="暂无通知" description="没有新的通知消息" />
      ) : (
        <div className="space-y-1.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`ios-card cursor-pointer ${!n.is_read ? 'border-l-4 border-l-ios-blue' : ''}`}
            >
              <div className="flex items-start gap-3">
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-ios-blue mt-1.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${n.is_read ? 'text-ios-text' : 'text-ios-text font-semibold'}`}>{n.title}</div>
                  <div className="text-ios-muted text-xs mt-0.5">{n.content}</div>
                  <div className="text-ios-muted text-[10px] mt-1">{new Date(n.created_at).toLocaleString('zh-CN')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Preferences */}
      <div className="ios-card">
        <h3 className="text-ios-text text-sm font-semibold mb-3">通知偏好</h3>
        <div className="space-y-3">
          {preferences.length === 0 ? (
            <div className="text-ios-muted text-xs">暂无偏好设置</div>
          ) : (
            preferences.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-ios-text text-sm">{p.notification_type}</span>
                <button
                  onClick={async () => {
                    try {
                      await notificationApi.updatePreferences([{
                        notification_type: p.notification_type,
                        enabled: !p.enabled,
                      }]);
                      setPreferences((prev) =>
                        prev.map((x) => (x.id === p.id ? { ...x, enabled: !x.enabled } : x))
                      );
                    } catch {}
                  }}
                  className={`w-11 h-6 rounded-full transition-colors ${p.enabled ? 'bg-ios-green' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${p.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

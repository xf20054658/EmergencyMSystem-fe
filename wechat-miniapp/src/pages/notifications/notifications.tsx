// ============================================================
// 通知中心
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { notificationService } from '@/services';
import type { Notification } from '@/types/models';
import TabBar from '@/components/TabBar';
import './notifications.scss';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationService.list()
      .then(setNotifications)
      .catch(() => {});
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      Taro.showToast({ title: '已全部标为已读', icon: 'success' });
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  return (
    <View className="page-notifications safe-bottom">
      {/* 导航栏 */}
      <View className="notif-nav">
        <Text className="notif-nav__title">服务通知</Text>
        {notifications.length > 0 && (
          <Text className="notif-nav__action" onClick={handleMarkAllRead}>全部已读</Text>
        )}
      </View>
      <ScrollView scrollY className="notif-list">
        {notifications.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">🔔</Text>
            <Text className="empty-text">暂无通知</Text>
          </View>
        ) : (
          notifications.map(n => (
            <View key={n.id} className={`notif-item ${n.is_read ? 'notif-item--read' : ''}`}>
              <View className="notif-dot" />
              <View className="notif-content">
                <View className="notif-header">
                  <Text className="notif-title">{n.title}</Text>
                  <Text className="notif-time">{formatTime(n.created_at)}</Text>
                </View>
                <Text className="notif-body">{n.content}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <TabBar />
    </View>
  );
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch { return dateStr; }
}

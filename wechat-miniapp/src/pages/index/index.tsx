// ============================================================
// 首页 — SOS + 快捷功能 + 公告 + 救援动态
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, Navigator } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SOSButton from '@/components/SOSButton';
import { sosService, dashboardService } from '@/services';
import type { Announcement, RescueUpdate } from '@/types/models';
import { ALERT_LEVEL_LABELS } from '@/utils/constants';
import './index.scss';

const ALERT_COLORS: Record<string, string> = {
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  blue: '#007AFF',
};

export default function IndexPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [updates, setUpdates] = useState<RescueUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [locationText, setLocationText] = useState('');

  useEffect(() => {
    loadData();
    // 读取缓存的用户信息
    try {
      const u = Taro.getStorageSync('user');
      if (u) {
        const user = JSON.parse(u);
        setUserName(user?.name || '');
      }
    } catch {}
    // 读取上次缓存的位置
    const savedLoc = Taro.getStorageSync('last_known_address');
    if (savedLoc) setLocationText(savedLoc);
  }, []);

  const loadData = async () => {
    try {
      const [a, u] = await Promise.all([
        dashboardService.getAnnouncements(),
        dashboardService.getRescueUpdates(),
      ]);
      setAnnouncements(a || []);
      setUpdates((u || []).slice(0, 5));
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (url: string) => {
    const tabPages = ['/pages/map/map', '/pages/report/report', '/pages/help/help', '/pages/profile/profile'];
    if (tabPages.includes(url)) {
      Taro.switchTab({ url });
    } else {
      Taro.navigateTo({ url });
    }
  };

  const handleProfile = () => {
    Taro.switchTab({ url: '/pages/profile/profile' });
  };

  const handleSOSConfirm = async (lat: number, lng: number) => {
    try {
      await sosService.trigger({ lat, lng, location_source: 'gps' });
      Taro.showToast({ title: '求助已发出，救援力量正在响应', icon: 'success' });
    } catch {
      Taro.showToast({ title: '求助发送失败，请重试', icon: 'none' });
    }
  };

  return (
    <View className="page-index safe-bottom">
      {/* Header */}
      <View className="header">
        <View>
          <Text className="header__title">洪涝应急</Text>
          <Text className="header__subtitle">广西洪涝灾害应急管理平台</Text>
          {locationText && (
            <Text className="header__location">📍 {locationText}</Text>
          )}
        </View>
        <View className="header__actions">
          <Navigator url="/pages/notifications/notifications" className="header__bell">
            🔔
          </Navigator>
          <View onClick={handleProfile} className="header__user">
            👤
          </View>
        </View>
      </View>

      {/* 预警横幅 */}
      <View className="alert-banner">
        <View className="alert-banner__dot" />
        <Text className="alert-banner__text">防汛II级应急响应</Text>
        <Text className="alert-banner__count">3条I级预警</Text>
      </View>

      {/* SOS */}
      <View className="sos-section">
        <SOSButton onConfirm={handleSOSConfirm} />
        <Text className="sos-hint">长按1.5秒 · 二次确认</Text>
      </View>

      {/* 快捷入口 */}
      <View className="quick-actions">
        <View onClick={() => handleQuickAction('/pages/report/report')} className="quick-item quick-item--red">📋<Text>求助上报</Text></View>
        <View onClick={() => handleQuickAction('/pages/map/map')} className="quick-item quick-item--blue">🗺️<Text>灾情地图</Text></View>
        <View onClick={() => handleQuickAction('/pages/help/help')} className="quick-item quick-item--green">🤝<Text>我想帮忙</Text></View>
        <Navigator url="/pages/shelters/shelters" className="quick-item quick-item--orange">🏠<Text>避难所</Text></Navigator>
      </View>

      {/* 公告 */}
      {announcements.length > 0 && (
        <View className="card card--warning">
          <Text className="section-title">📢 最新公告</Text>
          <View className="section-list">
            {announcements.slice(0, 3).map(a => (
              <View key={a.id} className="announcement-item">
                <View
                  className="level-badge"
                  style={{ background: ALERT_COLORS[a.level] || '#8E8E93' }}
                >
                  <Text className="level-badge__text">{ALERT_LEVEL_LABELS[a.level]}</Text>
                </View>
                <View className="announcement-info">
                  <Text className="announcement-title">{a.title}</Text>
                  <Text className="announcement-time">{formatTime(a.published_at)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 救援动态 */}
      <View className="card">
        <Text className="section-title">⏱ 救援动态</Text>
        <View className="section-list">
          {updates.length === 0 ? (
            <Text className="text-muted text-sm">暂无动态</Text>
          ) : (
            updates.map((u, i) => (
              <View key={u.id || i} className="timeline-item">
                <View className="timeline-dot" />
                {i < updates.length - 1 && <View className="timeline-line" />}
                <View className="timeline-content">
                  <Text className="timeline-text">{u.content}</Text>
                  <Text className="timeline-time">{formatTime(u.created_at)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* 底部占位 */}
      <View className="bottom-spacer" />
    </View>
  );
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch { return dateStr; }
}

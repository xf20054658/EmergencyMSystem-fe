// ============================================================
// 灾情地图 — 预警信息 + 地图标记
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { dashboardService } from '@/services';
import type { DisasterAlert } from '@/types/models';
import { ALERT_LEVEL_LABELS } from '@/utils/constants';
import './map.scss';

const ALERT_BG: Record<string, string> = {
  red: 'rgba(255,59,48,0.1)',
  orange: 'rgba(255,149,0,0.1)',
  yellow: 'rgba(255,204,0,0.1)',
  blue: 'rgba(0,122,255,0.1)',
};

const ALERT_BORDER: Record<string, string> = {
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  blue: '#007AFF',
};

export default function MapPage() {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);

  useEffect(() => {
    dashboardService.getAlerts().then(setAlerts).catch(() => {});
  }, []);

  return (
    <View className="page-map safe-bottom">
      {/* 地图占位区域 */}
      <View className="map-container">
        <View className="map-placeholder">
          <Text className="map-placeholder__icon">🗺️</Text>
          <Text className="map-placeholder__text">灾情地图</Text>
          <Text className="map-placeholder__hint">实时展示受灾区域与救援力量分布</Text>
        </View>
      </View>

      {/* 预警列表 */}
      <View className="alerts-section">
        <Text className="section-title">⚠️ 灾情预警</Text>
        <ScrollView scrollY className="alerts-scroll">
          {alerts.length === 0 ? (
            <View className="empty-state">
              <Text className="text-muted text-sm">暂无灾情预警</Text>
            </View>
          ) : (
            alerts.map(alert => (
              <View
                key={alert.id}
                className="alert-card"
                style={{
                  background: ALERT_BG[alert.level] || '#F2F2F7',
                  borderColor: ALERT_BORDER[alert.level] || '#E5E5EA',
                }}
              >
                <View className="alert-header">
                  <View
                    className="alert-level"
                    style={{ background: ALERT_BORDER[alert.level] || '#8E8E93' }}
                  >
                    <Text className="alert-level__text">{ALERT_LEVEL_LABELS[alert.level]}</Text>
                  </View>
                  <Text className="alert-time">{formatTime(alert.issued_at)}</Text>
                </View>
                <Text className="alert-title">{alert.title}</Text>
                {alert.description && <Text className="alert-desc">{alert.description}</Text>}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch { return dateStr; }
}

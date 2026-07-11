// ============================================================
// 避难所 — 附近安置点列表
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { shelterService } from '@/services';
import type { Shelter } from '@/types/models';
import { SHELTER_STATUS_LABELS } from '@/utils/constants';
import './shelters.scss';

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    shelterService.list().then(setShelters).catch(() => {});
  }, []);

  const getOccupancyRate = (s: Shelter) => {
    if (!s.capacity) return 0;
    return Math.round((s.current_occupancy / s.capacity) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#34C759';
      case 'full': return '#FF3B30';
      case 'preparing': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  return (
    <View className="page-shelters safe-bottom">
      <View className="shelters-nav">
        <Text className="shelters-nav__title">附近避难所</Text>
      </View>
      <ScrollView scrollY className="shelters-list">
        {shelters.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">🏠</Text>
            <Text className="empty-text">暂无避难所信息</Text>
          </View>
        ) : (
          shelters.map(s => {
            const rate = getOccupancyRate(s);
            const color = getStatusColor(s.status);
            return (
              <View key={s.id} className="shelter-card">
                <View className="shelter-header">
                  <View>
                    <Text className="shelter-name">{s.name}</Text>
                    <Text className="shelter-addr">📍 {s.address}</Text>
                  </View>
                  <View className="shelter-status" style={{ background: color }}>
                    <Text className="shelter-status__text">
                      {SHELTER_STATUS_LABELS[s.status] || s.status}
                    </Text>
                  </View>
                </View>

                <View className="shelter-body">
                  <View className="shelter-stat">
                    <Text className="shelter-stat__label">容量</Text>
                    <Text className="shelter-stat__value">{s.capacity}</Text>
                  </View>
                  <View className="shelter-stat">
                    <Text className="shelter-stat__label">在住</Text>
                    <Text className="shelter-stat__value">{s.current_occupancy}</Text>
                  </View>
                  <View className="shelter-stat">
                    <Text className="shelter-stat__label">入住率</Text>
                    <Text className="shelter-stat__value" style={{ color }}>{rate}%</Text>
                  </View>
                </View>

                {/* 入住率进度条 */}
                <View className="progress-bar">
                  <View
                    className="progress-bar__fill"
                    style={{
                      width: `${Math.min(rate, 100)}%`,
                      background: color,
                    }}
                  />
                </View>

                {s.contact_phone && (
                  <Text className="shelter-contact">📞 {s.contact_phone}</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

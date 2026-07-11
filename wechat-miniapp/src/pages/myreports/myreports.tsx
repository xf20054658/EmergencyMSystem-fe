// ============================================================
// 我的上报 — 历史求助列表
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { helpRequestService } from '@/services';
import type { HelpRequest } from '@/types/models';
import { REQUEST_STATUS_LABELS, URGENCY_LABELS } from '@/utils/constants';
import TabBar from '@/components/TabBar';
import './myreports.scss';

export default function MyReportsPage() {
  const [reports, setReports] = useState<HelpRequest[]>([]);

  useEffect(() => {
    helpRequestService.list({ owner_only: true })
      .then(setReports)
      .catch(() => {});
  }, []);

  return (
    <View className="page-myreports safe-bottom">
      <ScrollView scrollY className="reports-list">
        {reports.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-text">暂无上报记录</Text>
          </View>
        ) : (
          reports.map(r => (
            <View key={r.id} className="report-card">
              <View className="report-header">
                <Text className="report-urgency">
                  {URGENCY_LABELS[r.urgency] || r.urgency}
                </Text>
                <View className={`status-tag status-tag--${r.status}`}>
                  <Text className="status-tag__text">
                    {REQUEST_STATUS_LABELS[r.status] || r.status}
                  </Text>
                </View>
              </View>
              <Text className="report-title">{r.title}</Text>
              {r.address && <Text className="report-addr">📍 {r.address}</Text>}
              <Text className="report-time">{formatTime(r.created_at)}</Text>
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
    return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch { return dateStr; }
}

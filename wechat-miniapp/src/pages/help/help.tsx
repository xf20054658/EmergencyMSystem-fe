// ============================================================
// 我要帮忙 — 附近求助列表 + 接单
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { matchService } from '@/services';
import type { Match } from '@/types/models';
import { MATCH_STATUS_LABELS, URGENCY_LABELS, VUL_GROUP_LABELS } from '@/utils/constants';
import './help.scss';

const URGENCY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: '#FFE5E5', text: '#FF3B30' },
  high: { bg: '#FFF3E0', text: '#FF9500' },
  medium: { bg: '#FFF8E1', text: '#FFCC00' },
  low: { bg: '#E8F5E9', text: '#34C759' },
};

export default function HelpPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await matchService.nearby();
      setMatches(data || []);
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId: string) => {
    try {
      await matchService.accept(matchId);
      Taro.showToast({ title: '已接单', icon: 'success' });
      loadMatches();
    } catch (e: unknown) {
      Taro.showToast({ title: (e as Error).message || '操作失败', icon: 'none' });
    }
  };

  const formatDistance = (score: number) => {
    // 模拟距离：匹配分越高距离越近
    const dist = Math.round((1 - score) * 10 * 10) / 10;
    return dist < 0.5 ? '<500m' : `${dist.toFixed(1)}km`;
  };

  return (
    <View className="page-help safe-bottom">
      <View className="help-header">
        <Text className="help-title">我要帮忙</Text>
        <Text className="help-refresh" onClick={loadMatches}>刷新</Text>
      </View>

      <ScrollView scrollY className="help-list">
        {loading ? (
          <View className="empty-state">
            <Text className="text-muted">加载中...</Text>
          </View>
        ) : matches.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">🤝</Text>
            <Text className="empty-text">附近暂无待匹配的求助</Text>
            <Text className="empty-hint">下拉刷新试试</Text>
          </View>
        ) : (
          matches.map(m => {
            const req = m.help_request;
            const urgencyColor = URGENCY_COLORS[req?.urgency || 'medium'];
            return (
              <View key={m.id} className="help-card">
                {/* 头部：标题 + 状态 */}
                <View className="help-card__header">
                  <Text className="help-card__title" numberOfLines={1}>
                    {req?.title || '未知求助'}
                  </Text>
                  <View className={`status-tag status-tag--${m.match_status}`}>
                    <Text className="status-tag__text">
                      {MATCH_STATUS_LABELS[m.match_status] || m.match_status}
                    </Text>
                  </View>
                </View>

                {/* 信息行 */}
                <View className="help-card__info">
                  {req?.urgency && (
                    <View className="urgency-badge" style={{ background: urgencyColor.bg }}>
                      <Text style={{ color: urgencyColor.text, fontSize: '22rpx' }}>
                        {URGENCY_LABELS[req.urgency]}
                      </Text>
                    </View>
                  )}
                  <Text className="help-card__distance">📍 {formatDistance(m.match_score)}</Text>
                  <Text className="help-card__score">匹配度 {Math.round(m.match_score * 100)}%</Text>
                </View>

                {/* 地址 */}
                {req?.address && (
                  <Text className="help-card__address" numberOfLines={1}>
                    {req.address}
                  </Text>
                )}

                {/* 描述 */}
                {req?.description && (
                  <Text className="help-card__desc" numberOfLines={2}>
                    {req.description}
                  </Text>
                )}

                {/* 人数 + 特殊群体 */}
                <View className="help-card__tags">
                  {req?.people_count !== undefined && req.people_count > 0 && (
                    <View className="meta-tag">
                      <Text className="meta-tag__text">👥 {req.people_count}人</Text>
                    </View>
                  )}
                  {req?.vulnerable_groups && req.vulnerable_groups.length > 0 && (
                    req.vulnerable_groups.map(g => (
                      <View key={g} className="meta-tag meta-tag--vul">
                        <Text className="meta-tag__text">{VUL_GROUP_LABELS[g] || g}</Text>
                      </View>
                    ))
                  )}
                  {req?.is_proxy && (
                    <View className="meta-tag meta-tag--proxy">
                      <Text className="meta-tag__text">代报</Text>
                    </View>
                  )}
                </View>

                {/* 操作按钮 */}
                {m.match_status === 'pending' && (
                  <View className="help-card__actions">
                    <Button
                      className="btn-accept"
                      onClick={() => handleAccept(m.id)}
                    >
                      接单
                    </Button>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

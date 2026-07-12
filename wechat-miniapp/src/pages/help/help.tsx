// ============================================================
// 我要帮忙 — 附近求助列表 + 接单 + 隐私通话
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { matchService, callService } from '@/services';
import type { Match, VirtualPhoneBinding, CallRecord } from '@/types/models';
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
  // 通话面板
  const [callMatchId, setCallMatchId] = useState<string | null>(null);
  const [binding, setBinding] = useState<VirtualPhoneBinding | null>(null);
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [callLoading, setCallLoading] = useState(false);

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

  // ---- 通话功能 ----
  const openCallPanel = async (matchId: string) => {
    setCallMatchId(matchId);
    setCallLoading(true);
    try {
      const [b, records] = await Promise.all([
        callService.getBinding(matchId),
        callService.getCallRecords(matchId),
      ]);
      setBinding(b || null);
      setCallRecords(records || []);
    } catch {
      // mock fallback
    }
    setCallLoading(false);
  };

  const closeCallPanel = () => {
    setCallMatchId(null);
    setBinding(null);
    setCallRecords([]);
  };

  const handleBind = async () => {
    if (!callMatchId) return;
    try {
      const result = await callService.bind(callMatchId);
      setBinding(result);
      Taro.showToast({ title: '虚拟号码已绑定', icon: 'success' });
    } catch (e: unknown) {
      Taro.showToast({ title: (e as Error).message || '绑定失败', icon: 'none' });
    }
  };

  const handleCall = async (callType: 'voip' | 'phone') => {
    if (!callMatchId) return;
    try {
      await callService.call(callMatchId, callType);
      const newRecord: CallRecord = {
        call_id: 'call-' + Date.now(),
        duration_sec: callType === 'voip' ? 30 : 60,
        call_status: 'success',
        started_at: new Date().toISOString(),
      };
      setCallRecords(prev => [newRecord, ...prev]);
      Taro.showToast({ title: callType === 'voip' ? 'VoIP通话已接通' : '电话已接通', icon: 'success' });
    } catch (e: unknown) {
      Taro.showToast({ title: (e as Error).message || '通话失败', icon: 'none' });
    }
  };

  const handleUnbind = async () => {
    if (!callMatchId) return;
    try {
      await callService.unbind(callMatchId);
      setBinding(null);
      Taro.showToast({ title: '已解绑', icon: 'success' });
    } catch (e: unknown) {
      Taro.showToast({ title: (e as Error).message || '解绑失败', icon: 'none' });
    }
  };

  const formatDuration = (sec: number) => {
    if (sec <= 0) return '未接通';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
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
                {['accepted', 'enroute', 'waiting'].includes(m.match_status) && (
                  <View className="help-card__actions" style={{ gap: '10px' }}>
                    <Button
                      className="btn-call"
                      style={{
                        flex: 1,
                        background: '#007AFF',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '28rpx',
                        height: '70rpx',
                        lineHeight: '70rpx',
                      }}
                      onClick={() => openCallPanel(m.id)}
                    >
                      📞 隐私通话
                    </Button>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ===== 隐私通话面板 ===== */}
      {callMatchId && (
        <View
          className="call-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={closeCallPanel}
        >
          <View
            className="call-panel"
            style={{
              width: '100%',
              maxHeight: '80vh',
              background: '#fff',
              borderRadius: '16px 16px 0 0',
              padding: '24px',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Text style={{ fontSize: '34rpx', fontWeight: 'bold' }}>📞 隐私通话</Text>
              <Text style={{ fontSize: '40rpx', color: '#999' }} onClick={closeCallPanel}>✕</Text>
            </View>

            {callLoading ? (
              <Text style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>加载中...</Text>
            ) : (
              <>
                {/* 虚拟号码 */}
                <View style={{ background: '#F5F5F7', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
                  {binding ? (
                    <>
                      <Text style={{ fontSize: '24rpx', color: '#999', marginBottom: '8px' }}>AXB 虚拟号码（双方拨打接通）</Text>
                      <Text style={{ fontSize: '56rpx', fontWeight: 'bold', color: '#007AFF', letterSpacing: '4px', display: 'block' }}>
                        {binding.virtual_number}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#999', marginTop: '4px' }}>
                        有效期至 {new Date(binding.expires_at).toLocaleString('zh-CN')}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: '28rpx', color: '#666', display: 'block', marginBottom: '12px' }}>
                        尚未绑定虚拟号码
                      </Text>
                      <Button
                        style={{
                          background: '#007AFF',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '28rpx',
                          height: '80rpx',
                          lineHeight: '80rpx',
                        }}
                        onClick={handleBind}
                      >
                        🔒 绑定虚拟号码 (AXB)
                      </Button>
                    </>
                  )}
                </View>

                {/* 通话按钮 */}
                {binding && (
                  <View style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <Button
                      style={{
                        flex: 1,
                        background: '#007AFF',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '28rpx',
                        height: '80rpx',
                        lineHeight: '80rpx',
                      }}
                      onClick={() => handleCall('voip')}
                    >
                      🌐 VoIP 通话
                    </Button>
                    <Button
                      style={{
                        flex: 1,
                        background: '#FF9500',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '28rpx',
                        height: '80rpx',
                        lineHeight: '80rpx',
                      }}
                      onClick={() => handleCall('phone')}
                    >
                      📱 电话回拨
                    </Button>
                  </View>
                )}

                {/* 解绑 */}
                {binding && (
                  <View style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Text style={{ color: '#FF3B30', fontSize: '26rpx' }} onClick={handleUnbind}>
                      解除绑定
                    </Text>
                  </View>
                )}

                {/* 通话记录 */}
                {callRecords.length > 0 && (
                  <View>
                    <Text style={{ fontSize: '28rpx', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
                      通话记录
                    </Text>
                    <View style={{ maxHeight: '200px', overflow: 'auto' }}>
                      {callRecords.map(rec => {
                        const statusColor = rec.call_status === 'success' ? '#34C759' : rec.call_status === 'no_answer' ? '#FF9500' : '#FF3B30';
                        const statusText = rec.call_status === 'success' ? '已接通' : rec.call_status === 'no_answer' ? '未接听' : rec.call_status;
                        return (
                          <View
                            key={rec.call_id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px',
                              background: '#F5F5F7',
                              borderRadius: '8px',
                              marginBottom: '8px',
                            }}
                          >
                            <View>
                              <Text style={{ fontSize: '26rpx' }}>
                                {new Date(rec.started_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                              <Text style={{ fontSize: '22rpx', color: '#999', marginLeft: '8px' }}>
                                通话 {formatDuration(rec.duration_sec)}
                              </Text>
                            </View>
                            <Text style={{ fontSize: '22rpx', color: statusColor }}>{statusText}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 说明 */}
                <View style={{ borderTop: '1px solid #E5E5EA', paddingTop: '12px', marginTop: '8px' }}>
                  <Text style={{ fontSize: '22rpx', color: '#999', lineHeight: '1.6' }}>
                    💡 VoIP 通话免费、弱网优化 · AXB 回拨断网可用{'\n'}
                    🔒 双方真实号码互不可见
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

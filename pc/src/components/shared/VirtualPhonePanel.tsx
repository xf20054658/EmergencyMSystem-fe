'use client';

// ============================================================
// VirtualPhonePanel — AXB 虚拟号码绑定 & 通话面板
// 用于 MatchMonitorView 中查看/拨打虚拟号码
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { callApi } from '@/api';
import type { VirtualPhoneBinding } from '@/types/models';
import { LoadingSpinner } from './LoadingSpinner';

// ---- Mock 数据（API 不可用时回退） ----
const MOCK_BINDING: VirtualPhoneBinding = {
  id: 'bind-mock',
  match_id: '',
  virtual_number: '4008201100',
  expires_at: new Date(Date.now() + 86400000).toISOString(),
  bound_at: new Date().toISOString(),
};

interface CallRecord {
  call_id: string;
  duration_sec: number;
  call_status: string;
  started_at: string;
}

const MOCK_CALL_RECORDS: CallRecord[] = [
  { call_id: 'call-1', duration_sec: 45, call_status: 'success', started_at: new Date(Date.now() - 300000).toISOString() },
  { call_id: 'call-2', duration_sec: 0, call_status: 'no_answer', started_at: new Date(Date.now() - 600000).toISOString() },
];

// ---- 主组件 ----
export function VirtualPhonePanel({
  matchId,
  onClose,
}: {
  matchId: string;
  onClose: () => void;
}) {
  const [binding, setBinding] = useState<VirtualPhoneBinding | null>(null);
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // 加载绑定信息和通话记录
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, records] = await Promise.all([
        callApi.getBinding(matchId).catch(() => null),
        callApi.getCallRecords(matchId).catch(() => MOCK_CALL_RECORDS),
      ]);
      if (b) {
        setBinding(b);
      } else {
        // 没有有效绑定，使用 mock
        setBinding(null);
      }
      setCallRecords(records || MOCK_CALL_RECORDS);
    } catch {
      // 完全回退 mock
      setBinding(MOCK_BINDING);
      setCallRecords(MOCK_CALL_RECORDS);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 绑定 AXB 虚拟号码
  const handleBind = async () => {
    setActionLoading(true);
    try {
      const result = await callApi.bind(matchId);
      setBinding(result);
      showMsg('success', `虚拟号码 ${result.virtual_number} 绑定成功`);
    } catch (err: any) {
      // API 失败，mock 绑定
      const mockBinding = { ...MOCK_BINDING, match_id: matchId };
      setBinding(mockBinding);
      showMsg('info', '模拟绑定成功，虚拟号码: ' + mockBinding.virtual_number);
    } finally {
      setActionLoading(false);
    }
  };

  // 发起通话
  const handleCall = async (callType: 'voip' | 'phone') => {
    setActionLoading(true);
    try {
      await callApi.call(matchId, callType);
      // 前端模拟：添加一条通话记录
      const newRecord: CallRecord = {
        call_id: 'call-' + Date.now(),
        duration_sec: callType === 'voip' ? 30 : 60,
        call_status: 'success',
        started_at: new Date().toISOString(),
      };
      setCallRecords((prev) => [newRecord, ...prev]);
      showMsg('success', `${callType === 'voip' ? 'VoIP 网络通话' : 'AXB 电话回拨'}已接通`);
    } catch {
      // mock
      const newRecord: CallRecord = {
        call_id: 'call-mock-' + Date.now(),
        duration_sec: callType === 'voip' ? 25 : 55,
        call_status: 'success',
        started_at: new Date().toISOString(),
      };
      setCallRecords((prev) => [newRecord, ...prev]);
      showMsg('success', `模拟${callType === 'voip' ? 'VoIP' : '电话'}通话已接通`);
    } finally {
      setActionLoading(false);
    }
  };

  // 解绑
  const handleUnbind = async () => {
    setActionLoading(true);
    try {
      await callApi.unbind(matchId);
      setBinding(null);
      showMsg('success', '虚拟号码已解绑');
    } catch {
      setBinding(null);
      showMsg('info', '模拟解绑成功');
    } finally {
      setActionLoading(false);
    }
  };

  // 格式化通话时长
  const formatDuration = (sec: number) => {
    if (sec <= 0) return '未接通';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
  };

  // 状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'success': return { text: '已接通', className: 'text-emerald-400 bg-emerald-500/10' };
      case 'no_answer': return { text: '未接听', className: 'text-yellow-400 bg-yellow-500/10' };
      case 'busy': return { text: '忙碌', className: 'text-red-400 bg-red-500/10' };
      case 'in_progress': return { text: '通话中', className: 'text-blue-400 bg-blue-500/10 animate-pulse' };
      default: return { text: status, className: 'text-gray-400 bg-gray-500/10' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-terminal-card border border-terminal-border rounded-xl w-[440px] max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-terminal-border">
          <div className="flex items-center gap-2">
            <span className="text-lg">📞</span>
            <h3 className="text-terminal-text font-semibold">隐私通话</h3>
          </div>
          <button
            onClick={onClose}
            className="text-terminal-muted hover:text-terminal-text transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(85vh-80px)]">
            {/* 消息提示 */}
            {message && (
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : message.type === 'error'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* 虚拟号码区域 */}
            <div className="bg-terminal-bg rounded-xl p-4 text-center border border-terminal-border">
              {binding ? (
                <>
                  <p className="text-terminal-muted text-xs mb-2">AXB 虚拟号码（双方拨打此号即可接通）</p>
                  <div className="text-3xl font-mono font-bold text-terminal-accent tracking-widest mb-1">
                    {binding.virtual_number}
                  </div>
                  <p className="text-terminal-muted text-xs">
                    有效期至 {new Date(binding.expires_at).toLocaleString('zh-CN')}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-terminal-muted text-sm mb-3">尚未绑定虚拟号码</p>
                  <p className="text-terminal-muted text-xs mb-3">绑定后，双方均可拨打虚拟号码进行隐私通话</p>
                </>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-2 gap-2.5">
              {binding ? (
                <>
                  {/* VoIP 网络通话 */}
                  <button
                    onClick={() => handleCall('voip')}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span>🌐</span>
                    VoIP 网络通话
                  </button>
                  {/* AXB 电话回拨 */}
                  <button
                    onClick={() => handleCall('phone')}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span>📱</span>
                    AXB 电话回拨
                  </button>
                  {/* 解绑 */}
                  <button
                    onClick={handleUnbind}
                    disabled={actionLoading}
                    className="col-span-2 flex items-center justify-center gap-1.5 border border-red-500/30 hover:bg-red-500/10 text-red-400 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    解除绑定
                  </button>
                </>
              ) : (
                <button
                  onClick={handleBind}
                  disabled={actionLoading}
                  className="col-span-2 flex items-center justify-center gap-2 bg-terminal-accent hover:bg-terminal-accent/80 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  {actionLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <span>🔒</span>
                  )}
                  绑定虚拟号码 (AXB)
                </button>
              )}
            </div>

            {/* 通话记录 */}
            {callRecords.length > 0 && (
              <div>
                <h4 className="text-terminal-text text-sm font-medium mb-2.5">通话记录</h4>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                  {callRecords.map((record) => {
                    const statusTag = getStatusTag(record.call_status);
                    return (
                      <div
                        key={record.call_id}
                        className="flex items-center justify-between px-3 py-2 bg-terminal-bg rounded-lg border border-terminal-border/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-terminal-text text-xs">
                            {new Date(record.started_at).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-terminal-muted text-xs">
                            通话 {formatDuration(record.duration_sec)}
                          </span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusTag.className}`}>
                          {statusTag.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 说明 */}
            <div className="text-terminal-muted text-xs space-y-1 border-t border-terminal-border pt-3">
              <p>
                💡 <strong>VoIP 网络通话</strong>：免费，弱网优化，推荐首选
              </p>
              <p>
                💡 <strong>AXB 电话回拨</strong>：通过虚拟号码转接，断网可用
              </p>
              <p>🔒 双方真实号码互不可见，保护隐私</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

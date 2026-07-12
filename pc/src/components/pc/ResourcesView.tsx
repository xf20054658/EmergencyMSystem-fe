'use client';

// ============================================================
// View: 物资调度 — 对齐原型设计（告警横幅 + 8 物资卡片 + 物流批次）
// ============================================================

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { dashboardApi } from '@/api';
import type { Resource, ResourceBatch, Escalation } from '@/types/models';
import { BatchStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';
import { MOCK_RESOURCES, MOCK_BATCHES, MOCK_ESCALATIONS } from '@/mock/data';

/** 物资类型图标映射 */
const RESOURCE_ICONS: Record<string, string> = {
  water: '💧',
  food: '🍜',
  boat: '🛶',
  pump: '⚙️',
  sandbag: '🟤',
  lifejacket: '🦺',
  medicine: '💊',
  generator: '⚡',
  // 兼容老数据
  tent: '⛺',
  blanket: '🛏️',
  clothing: '👕',
  fuel: '⛽',
  power: '🔋',
  default: '📦',
};

/** 8 类物资的 mock 需求数据（原型设计） */
const MOCK_DEMAND: Record<string, number> = {
  water: 12000,
  food: 8000,
  boat: 50,
  pump: 200,
  sandbag: 60000,
  lifejacket: 1200,
  medicine: 500,
  generator: 80,
};

/** 8 类物资的 mock 类型映射（将后端 type 映射到原型 key） */
const TYPE_MAP: Record<string, string> = {
  'water': 'water',
  'food': 'food',
  'medicine': 'medicine',
  'tent': 'tent',
  'blanket': 'blanket',
  'clothing': 'clothing',
  'fuel': 'fuel',
  'power': 'power',
  '饮用水': 'water',
  '方便食品': 'food',
  '冲锋舟': 'boat',
  '抽水泵': 'pump',
  '沙袋': 'sandbag',
  '救生衣': 'lifejacket',
  '药品': 'medicine',
  '发电机': 'generator',
};

function getResourceKey(r: Resource): string {
  return TYPE_MAP[r.type] || TYPE_MAP[r.name] || 'default';
}

function getDemand(r: Resource): number {
  const key = getResourceKey(r);
  return MOCK_DEMAND[key] || r.total_quantity || r.available_quantity * 2;
}

function getIcon(r: Resource): string {
  const key = getResourceKey(r);
  return RESOURCE_ICONS[key] || RESOURCE_ICONS.default;
}

function diffSeconds(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / 1000);
}
function diffMinutes(a: Date, b: Date) {
  return Math.floor(diffSeconds(a, b) / 60);
}
function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return '0秒';
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  if (min > 0) return `${min}分${sec}秒`;
  return `${sec}秒`;
}

function AlertBannerItem({ esc }: { esc: Escalation }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!esc.created_at) return;
    const timeoutAt = new Date(esc.created_at);
    timeoutAt.setMinutes(timeoutAt.getMinutes() + 10);
    const update = () => {
      const diff = diffSeconds(timeoutAt, new Date());
      setSeconds(diff > 0 ? diff : 0);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [esc.created_at]);

  const isRed = seconds > 0 && seconds <= 300;
  return (
    <div
      className={`rounded-lg px-4 py-2.5 flex items-center justify-between border ${
        isRed
          ? 'bg-red-950/40 border-red-500/30 text-red-400'
          : 'bg-yellow-950/40 border-yellow-500/30 text-yellow-400'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${isRed ? 'bg-red-500' : 'bg-yellow-500'}`} />
        <span className="text-sm font-medium shrink-0">
          {isRed
            ? `P2P匹配即将超时(${formatCountdown(seconds)})`
            : `P2P匹配超时(${formatCountdown(Math.abs(diffSeconds(new Date(esc.created_at || Date.now()), new Date())))})`}
        </span>
        <span className="text-xs opacity-70 truncate">
          {esc.escalate_reason || '出租车未响应'} · 超时后自动升级为集中派单
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        <span className="text-xs opacity-60">
          {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · {esc.id.slice(0, 12)}
        </span>
        {isRed ? (
          <button className="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded transition-colors">
            立即处理
          </button>
        ) : (
          <button className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-2.5 py-1 rounded transition-colors">
            升级派单
          </button>
        )}
      </div>
    </div>
  );
}

export function ResourcesView() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [batches, setBatches] = useState<ResourceBatch[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchFilter, setBatchFilter] = useState('');
  const isFirstLoad = useRef(true);

  const load = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    try {
      const [res, bat, esc] = await Promise.all([
        dashboardApi.getResources(),
        dashboardApi.getResourceBatches(batchFilter ? { status: batchFilter } : undefined),
        dashboardApi.getEscalations({ status: 'pending' }),
      ]);
      setResources(res.length > 0 ? res : MOCK_RESOURCES);
      setBatches(bat.items && bat.items.length > 0 ? bat.items : MOCK_BATCHES);
      setEscalations(esc.length > 0 ? esc.slice(0, 2) : MOCK_ESCALATIONS);
    } catch (err) {
      console.error('Load resources error:', err);
      setResources(MOCK_RESOURCES);
      setBatches(MOCK_BATCHES);
      setEscalations(MOCK_ESCALATIONS);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  }, [batchFilter]);

  useEffect(() => {
    isFirstLoad.current = true;
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* ===== 告警横幅 ===== */}
      {escalations.length > 0 && (
        <div className="space-y-2 mb-4">
          {escalations.map((esc) => (
            <AlertBannerItem key={esc.id} esc={esc} />
          ))}
        </div>
      )}

      {/* ===== 物资库存卡片（2列×4行） ===== */}
      <h3 className="text-terminal-text text-sm font-semibold mb-3">物资库存</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {resources.map((r) => {
          const demand = getDemand(r);
          const ratio = demand > 0 ? (r.available_quantity / demand) * 100 : 0;
          const isSufficient = ratio >= 70;
          const icon = getIcon(r);
          const ratioColor = isSufficient ? 'text-emerald-400' : 'text-yellow-400';
          const progressColor = isSufficient ? 'bg-emerald-500' : 'bg-yellow-500';
          const statusLabel = isSufficient ? '充足' : '紧张';
          const statusBg = isSufficient ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400';

          return (
            <div
              key={r.id}
              className="bg-terminal-card border border-terminal-border rounded-lg p-3 hover:border-terminal-border/80 transition-colors"
            >
              {/* 第一行：图标 + 名称 + 状态标签 + 百分比 */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{icon}</span>
                  <span className="text-terminal-text text-sm font-medium truncate">{r.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${statusBg}`}>
                    {statusLabel}
                  </span>
                </div>
                <span className={`text-lg font-bold ${ratioColor}`}>
                  {ratio.toFixed(0)}%
                </span>
              </div>

              {/* 第二行：库存 / 需求 */}
              <div className="text-terminal-muted text-[11px] mb-2">
                库存 {r.available_quantity.toLocaleString()} / 需求 {demand.toLocaleString()} {r.unit}
              </div>

              {/* 第三行：进度条 + 调配按钮 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-terminal-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  />
                </div>
                <button className="text-[10px] border border-terminal-border/50 hover:bg-terminal-border/20 text-terminal-muted px-2 py-0.5 rounded transition-colors shrink-0">
                  调配
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== 物流批次 ===== */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-terminal-text text-sm font-semibold">物流批次</h3>
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-terminal-text text-xs outline-none focus:border-terminal-accent"
        >
          <option value="">全部状态</option>
          <option value="preparing">备货中</option>
          <option value="in_transit">运输中</option>
          <option value="arrived">已到达</option>
          <option value="distributing">分发中</option>
          <option value="distributed">已分发</option>
          <option value="recalled">已召回</option>
          <option value="expired">已过期</option>
        </select>
      </div>

      {batches.length === 0 ? (
        <EmptyState icon="🚚" title="暂无物流批次" />
      ) : (
        <div className="bg-terminal-card border border-terminal-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-terminal-border text-terminal-muted">
                  <th className="text-left px-4 py-2.5 font-medium">批次号</th>
                  <th className="text-left px-4 py-2.5 font-medium">物资</th>
                  <th className="text-left px-4 py-2.5 font-medium">数量</th>
                  <th className="text-left px-4 py-2.5 font-medium">状态</th>
                  <th className="text-left px-4 py-2.5 font-medium">承运</th>
                  <th className="text-left px-4 py-2.5 font-medium">预计到达</th>
                  <th className="text-left px-4 py-2.5 font-medium">实际到达</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-b border-terminal-border hover:bg-terminal-border/20">
                    <td className="px-4 py-2.5 text-terminal-muted font-mono text-[11px]">{b.batch_no}</td>
                    <td className="px-4 py-2.5 text-terminal-text">{b.resource?.name || '-'}</td>
                    <td className="px-4 py-2.5 text-terminal-text">{b.quantity}</td>
                    <td className="px-4 py-2.5"><BatchStatusBadge status={b.status} /></td>
                    <td className="px-4 py-2.5 text-terminal-text">{b.carrier || '-'}</td>
                    <td className="px-4 py-2.5 text-terminal-muted whitespace-nowrap">
                      {b.estimated_arrival ? new Date(b.estimated_arrival).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-terminal-muted whitespace-nowrap">
                      {b.actual_arrival ? new Date(b.actual_arrival).toLocaleString('zh-CN') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

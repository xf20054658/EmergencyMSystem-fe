// ============================================================
// 灾情预警 API
// ============================================================

import { get, post, put, getPaginated } from './client';
import type { DisasterAlert, AutoTriggerRule } from '@/types/models';

export const alertApi = {
  /** 预警列表 */
  list: (params?: { level?: string; area_id?: string; is_active?: boolean }) =>
    getPaginated<DisasterAlert>('/alerts', params as unknown as Record<string, unknown>),

  /** 预警详情 */
  getById: (id: string) =>
    get<DisasterAlert>(`/alerts/${id}`),

  /** 发布预警 */
  create: (data: Omit<DisasterAlert, 'id' | 'issued_at' | 'is_active'>) =>
    post<DisasterAlert>('/alerts', data as unknown as Record<string, unknown>),

  /** 解除预警 */
  deactivate: (id: string) =>
    put<DisasterAlert>(`/alerts/${id}/deactivate`),

  /** 自动触发规则列表 */
  getTriggerRules: () =>
    get<AutoTriggerRule[]>('/alerts/trigger-rules'),

  /** 更新触发规则 */
  updateTriggerRule: (id: string, data: Partial<AutoTriggerRule>) =>
    put<AutoTriggerRule>(`/alerts/trigger-rules/${id}`, data as unknown as Record<string, unknown>),

  /** 启用/禁用触发规则 */
  toggleTriggerRule: (id: string, enabled: boolean) =>
    put<AutoTriggerRule>(`/alerts/trigger-rules/${id}/toggle`, { enabled }),
};

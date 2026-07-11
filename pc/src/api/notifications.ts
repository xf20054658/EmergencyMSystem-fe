// ============================================================
// 通知 API
// ============================================================

import { get, post, put, getPaginated } from './client';
import type { Notification, NotificationPreference, NotificationTemplate } from '@/types/models';
import type { PaginationParams } from '@/types/api';

export const notificationApi = {
  /** 通知列表 */
  list: (params?: PaginationParams & { unread_only?: boolean }) =>
    getPaginated<Notification>('/notifications', params as unknown as Record<string, unknown>),

  /** 标记已读 */
  markRead: (id: string) =>
    put<void>(`/notifications/${id}/read`),

  /** 全部已读 */
  markAllRead: () =>
    put<void>('/notifications/read-all'),

  /** 获取通知偏好 */
  getPreferences: () =>
    get<NotificationPreference[]>('/notifications/preferences'),

  /** 更新通知偏好 */
  updatePreferences: (preferences: { notification_type: string; enabled: boolean }[]) =>
    put<NotificationPreference[]>('/notifications/preferences', {
      preferences,
    } as unknown as Record<string, unknown>),

  /** 获取订阅模板 */
  getTemplates: () =>
    get<NotificationTemplate[]>('/notifications/templates'),

  /** 授权订阅 */
  subscribe: (templateId: string) =>
    post<{ success: boolean }>('/notifications/subscribe', { template_id: templateId }),
};

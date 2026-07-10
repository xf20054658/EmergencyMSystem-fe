// ============================================================
// 求助 API
// ============================================================

import { get, post, put, del, getPaginated } from './client';
import type { HelpRequest, RequestNeed } from '@/types/models';
import type { PaginationParams } from '@/types/api';

export interface HelpRequestFilters extends PaginationParams {
  urgency?: string;
  status?: string;
  route?: string;
  area_id?: string;
  keyword?: string;
  is_proxy?: boolean;
  vulnerable_group?: string;
}

export const helpRequestApi = {
  /** 求助列表（多维筛选） */
  list: (filters?: HelpRequestFilters) =>
    getPaginated<HelpRequest>('/help-requests', filters as unknown as Record<string, unknown>),

  /** 创建求助 */
  create: (data: Omit<HelpRequest, 'id' | 'request_no' | 'created_at' | 'updated_at' | 'needs' | 'matches'> & { needs?: Omit<RequestNeed, 'id' | 'help_request_id' | 'fulfilled'>[] }) =>
    post<HelpRequest>('/help-requests', data as unknown as Record<string, unknown>),

  /** 求助详情 */
  getById: (id: string) =>
    get<HelpRequest>(`/help-requests/${id}`),

  /** 更新求助 */
  update: (id: string, data: Partial<HelpRequest>) =>
    put<HelpRequest>(`/help-requests/${id}`, data as unknown as Record<string, unknown>),

  /** 取消求助 */
  cancel: (id: string) =>
    put<HelpRequest>(`/help-requests/${id}/cancel`),

  /** 删除求助 */
  delete: (id: string) =>
    del<void>(`/help-requests/${id}`),

  /** 代报（社区工作者代为上报） */
  proxyReport: (data: {
    proxy_name: string;
    proxy_phone: string;
    proxy_notify_method?: string;
    title: string;
    description?: string;
    urgency: string;
    lat: number;
    lng: number;
    address?: string;
    people_count?: number;
    vulnerable_groups?: string[];
    needs?: Omit<RequestNeed, 'id' | 'help_request_id' | 'fulfilled'>[];
  }) =>
    post<HelpRequest>('/help-requests/proxy', data as unknown as Record<string, unknown>),
};

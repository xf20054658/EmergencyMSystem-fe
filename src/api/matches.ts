// ============================================================
// 匹配 API
// ============================================================

import { get, post, put, getPaginated } from './client';
import type { Match, MatchRelay, MatchReinforcement } from '@/types/models';
import type { PaginationParams } from '@/types/api';

export interface MatchFilters extends PaginationParams {
  match_status?: string;
  route?: string;
  urgency?: string;
  volunteer_id?: string;
  help_request_id?: string;
  is_cooperative?: boolean;
}

export const matchApi = {
  /** 匹配列表 */
  list: (filters?: MatchFilters) =>
    getPaginated<Match>('/matches', filters as unknown as Record<string, unknown>),

  /** 匹配详情 */
  getById: (id: string) =>
    get<Match>(`/matches/${id}`),

  /** 志愿者接受匹配 */
  accept: (id: string) =>
    put<Match>(`/matches/${id}/accept`),

  /** 志愿者拒绝匹配 */
  reject: (id: string, reason?: string) =>
    put<Match>(`/matches/${id}/reject`, { reason }),

  /** 志愿者出发（enroute） */
  depart: (id: string) =>
    put<Match>(`/matches/${id}/enroute`),

  /** 标记为 waiting（道路受阻/交通堵塞） */
  setWaiting: (id: string, reason: string, etaMin?: number) =>
    put<Match>(`/matches/${id}/waiting`, { waiting_reason: reason, waiting_eta_min: etaMin }),

  /** 标记为 unreachable */
  setUnreachable: (id: string) =>
    put<Match>(`/matches/${id}/unreachable`),

  /** 提交任务完成 */
  complete: (id: string, data?: { photo_urls?: string[] }) =>
    post<Match>(`/matches/${id}/complete`, data as unknown as Record<string, unknown>),

  /** 请求增援 */
  reinforce: (matchId: string, reason: string) =>
    post<MatchReinforcement>(`/matches/${matchId}/reinforce`, { reason }),

  /** 开启/关闭 GPS 轨迹共享 */
  toggleLocationSharing: (id: string, enabled: boolean) =>
    put<Match>(`/matches/${id}/location-sharing`, { enabled }),

  // ===== 接力匹配 =====

  /** 获取接力链路 */
  getRelays: (matchId: string) =>
    get<MatchRelay[]>(`/matches/${matchId}/relays`),

  /** 创建接力匹配 */
  createRelay: (matchId: string, volunteerId: string) =>
    post<MatchRelay>(`/matches/${matchId}/relays`, { volunteer_id: volunteerId }),

  // ===== 协办匹配 =====

  /** 获取协办同组匹配 */
  getCooperative: (groupId: string) =>
    get<Match[]>(`/matches/cooperative/${groupId}`),

  // ===== GPS 轨迹 =====

  /** 获取志愿者实时轨迹 */
  getLocationTracks: (matchId: string, since?: string) =>
    get<{ volunteer_id: string; lat: number; lng: number; speed?: number; recorded_at: string }[]>(
      `/matches/${matchId}/tracks`,
      { since }
    ),
};

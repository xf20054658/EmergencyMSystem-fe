// ============================================================
// 指挥中心 Dashboard API
// ============================================================

import { get, getPaginated } from './client';
import type {
  DashboardStats,
  MatchStats,
  HelpRequest,
  Match,
  Resource,
  ResourceBatch,
  Shelter,
  RescueTeam,
  Escalation,
  Announcement,
  RescueUpdate,
} from '@/types/models';

export const dashboardApi = {
  /** 仪表盘统计 */
  getStats: () =>
    get<DashboardStats>('/dashboard/stats'),

  /** 实时求助流 */
  getRecentRequests: (limit?: number) =>
    get<HelpRequest[]>('/dashboard/recent-requests', { limit }),

  /** 实时匹配流 */
  getRecentMatches: (limit?: number) =>
    get<Match[]>('/dashboard/recent-matches', { limit }),

  /** 地图展示数据 */
  getMapData: () =>
    get<{
      requests: HelpRequest[];
      volunteers: { id: string; name: string; lat: number; lng: number; tier: string }[];
      shelters: Shelter[];
    }>('/dashboard/map'),

  /** 告警列表 */
  getEscalations: (params?: { status?: string }) =>
    get<Escalation[]>('/dashboard/escalations', params as unknown as Record<string, unknown>),

  /** 处理告警 */
  handleEscalation: (id: string) =>
    get<Escalation>(`/dashboard/escalations/${id}/handle`),

  // ===== 物资 =====

  /** 物资列表 */
  getResources: () =>
    get<Resource[]>('/dashboard/resources'),

  /** 物资批次 */
  getResourceBatches: (params?: { status?: string; resource_id?: string }) =>
    getPaginated<ResourceBatch>('/dashboard/resource-batches', params as unknown as Record<string, unknown>),

  // ===== 救援队伍 =====

  /** 救援队伍列表 */
  getRescueTeams: () =>
    get<RescueTeam[]>('/dashboard/rescue-teams'),

  // ===== 公告 =====

  /** 公告列表 */
  getAnnouncements: () =>
    get<Announcement[]>('/dashboard/announcements'),

  /** 救援动态 */
  getRescueUpdates: (params?: { help_request_id?: string }) =>
    get<RescueUpdate[]>('/dashboard/rescue-updates', params as unknown as Record<string, unknown>),

  // ===== 匹配效率统计 =====

  /** 匹配效率统计 */
  getMatchStats: (params?: { start_date?: string; end_date?: string }) =>
    get<MatchStats[]>('/dashboard/match-stats', params as unknown as Record<string, unknown>),
};

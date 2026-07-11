// ============================================================
// 志愿者 API
// ============================================================

import { get, post, put, getPaginated } from './client';
import type { Volunteer, VolunteerLocationTrack } from '@/types/models';
import type { PaginationParams } from '@/types/api';

export interface VolunteerFilters extends PaginationParams {
  tier?: string;
  available?: boolean;
  skill_type?: string;
  area_id?: string;
  frozen?: boolean;
  lat?: number;
  lng?: number;
  radius_km?: number;
}

export const volunteerApi = {
  /** 志愿者列表 */
  list: (filters?: VolunteerFilters) =>
    getPaginated<Volunteer>('/volunteers', filters as unknown as Record<string, unknown>),

  /** 志愿者详情 */
  getById: (id: string) =>
    get<Volunteer>(`/volunteers/${id}`),

  /** 注册志愿者 */
  register: (data: {
    real_name: string;
    id_number: string;
    skills: { skill_type: string; skill_level: string }[];
    max_distance_km?: number;
    certification_type?: string;
  }) =>
    post<Volunteer>('/volunteers/register', data as unknown as Record<string, unknown>),

  /** 更新志愿者信息 */
  update: (id: string, data: Partial<Volunteer>) =>
    put<Volunteer>(`/volunteers/${id}`, data as unknown as Record<string, unknown>),

  /** 获取附近任务 */
  getNearbyTasks: (lat: number, lng: number, radiusKm?: number) =>
    get<import('./matches').MatchFilters & { matches: import('@/types/models').Match[] }>(
      '/volunteers/nearby-tasks',
      { lat, lng, radius_km: radiusKm }
    ),

  /** 设置可用/不可用 */
  setAvailability: (id: string, available: boolean) =>
    put<Volunteer>(`/volunteers/${id}/availability`, { available }),

  /** 上传 GPS 位置 */
  reportLocation: (data: {
    match_id: string;
    lat: number;
    lng: number;
    speed?: number;
    accuracy?: number;
  }) =>
    post<VolunteerLocationTrack>('/volunteers/location', data as unknown as Record<string, unknown>),

  /** 获取日统计 */
  getDailyStats: (volunteerId: string, date?: string) =>
    get<import('@/types/models').VolunteerDailyStat[]>(`/volunteers/${volunteerId}/daily-stats`, { date }),
};

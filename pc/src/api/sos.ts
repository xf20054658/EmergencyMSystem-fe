// ============================================================
// SOS API
// ============================================================

import { post } from './client';
import type { SOSTrigger } from '@/types/models';

export const sosApi = {
  /** 触发 SOS */
  trigger: (data: {
    lat: number;
    lng: number;
    location_source?: string;
    last_known_lat?: number;
    last_known_lng?: number;
  }) =>
    post<SOSTrigger>('/sos/trigger', data as unknown as Record<string, unknown>),

  /** 确认 SOS（倒计时后） */
  confirm: (triggerId: string) =>
    post<SOSTrigger>(`/sos/${triggerId}/confirm`),

  /** 取消 SOS */
  cancel: (triggerId: string) =>
    post<SOSTrigger>(`/sos/${triggerId}/cancel`),
};

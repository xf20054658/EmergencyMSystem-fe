// ============================================================
// 通话 API (AXB 虚拟号码)
// ============================================================

import { post, get } from './client';
import type { VirtualPhoneBinding } from '@/types/models';

export const callApi = {
  /** AXB 号码绑定 */
  bind: (matchId: string, provider: 'aliyun' | 'tencent' = 'aliyun') =>
    post<VirtualPhoneBinding>(`/matches/${matchId}/bind`, { provider }),

  /** 发起通话 */
  call: (matchId: string, callType: 'voip' | 'phone' = 'voip') =>
    post<{ call_id: string; call_status: string }>(`/matches/${matchId}/call`, { call_type: callType }),

  /** 解绑 */
  unbind: (matchId: string) =>
    post<void>(`/matches/${matchId}/unbind`),

  /** 获取绑定信息 */
  getBinding: (matchId: string) =>
    get<VirtualPhoneBinding>(`/matches/${matchId}/binding`),

  /** 通话记录 */
  getCallRecords: (matchId: string) =>
    get<{ call_id: string; duration_sec: number; call_status: string; started_at: string }[]>(
      `/matches/${matchId}/call-records`
    ),
};

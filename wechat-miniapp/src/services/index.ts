// ============================================================
// API 接口服务 — 开发环境自动启用 Mock 数据
// Mock 数据来源: docs/html/designer/database/mock-data.sql
// ============================================================
import api from './api';
import { MOCK_ENABLED } from '@/utils/mock';
import {
  authServiceMock, helpRequestServiceMock, sosServiceMock,
  matchServiceMock, dashboardServiceMock,
  shelterServiceMock, notificationServiceMock,
} from '@/mock/service';
import type {
  User, LoginResponse, HelpRequest, Match, Shelter,
  Announcement, RescueUpdate, DisasterAlert, Notification,
} from '@/types/models';

// ---- Auth ----
const _authService = {
  sendOtp(phone: string) {
    return api.post<{ message: string }>('/auth/send-otp', { phone });
  },
  loginByOtp(phone: string, code: string) {
    return api.post<LoginResponse>('/auth/login-otp', { phone, code });
  },
  loginByWx(data: { js_code: string; encryptedData: string; iv: string }) {
    return api.post<LoginResponse>('/auth/login-wx', data);
  },
};

// ---- Help Requests ----
const _helpRequestService = {
  create(data: Record<string, unknown>) {
    return api.post<HelpRequest>('/help-requests', data);
  },
  list(params?: Record<string, unknown>) {
    return api.get<HelpRequest[]>('/help-requests', params);
  },
};

// ---- SOS ----
const _sosService = {
  trigger(data: { lat: number; lng: number; location_source: string }) {
    return api.post('/sos/trigger', data);
  },
};

// ---- Matches ----
const _matchService = {
  nearby() {
    return api.get<Match[]>('/matches/nearby');
  },
  accept(matchId: string) {
    return api.put<Match>(`/matches/${matchId}/accept`);
  },
  complete(matchId: string) {
    return api.put<Match>(`/matches/${matchId}/complete`);
  },
};

// ---- Dashboard ----
const _dashboardService = {
  getAnnouncements() {
    return api.get<Announcement[]>('/dashboard/announcements');
  },
  getRescueUpdates() {
    return api.get<RescueUpdate[]>('/dashboard/rescue-updates');
  },
  getAlerts() {
    return api.get<DisasterAlert[]>('/alerts');
  },
};

// ---- Shelters ----
const _shelterService = {
  list() {
    return api.get<Shelter[]>('/dashboard/shelters');
  },
};

// ---- Calls (AXB 虚拟号码通话) ----
import type { VirtualPhoneBinding, CallRecord } from '@/types/models';

const _callService = {
  bind(matchId: string) {
    return api.post<VirtualPhoneBinding>(`/matches/${matchId}/bind`, { provider: 'aliyun' } as any);
  },
  call(matchId: string, callType: 'voip' | 'phone' = 'voip') {
    return api.post<{ call_id: string; call_status: string }>(`/matches/${matchId}/call`, { call_type: callType } as any);
  },
  unbind(matchId: string) {
    return api.post<void>(`/matches/${matchId}/unbind`);
  },
  getBinding(matchId: string) {
    return api.get<VirtualPhoneBinding>(`/matches/${matchId}/binding`);
  },
  getCallRecords(matchId: string) {
    return api.get<CallRecord[]>(`/matches/${matchId}/call-records`);
  },
};

// Mock callService
const callServiceMock = {
  async bind(matchId: string) {
    console.log('[Mock] AXB绑定', matchId);
    return {
      id: 'bind-mock',
      match_id: matchId,
      virtual_number: '4008201100',
      status: 'bound',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      bound_at: new Date().toISOString(),
    } as VirtualPhoneBinding;
  },
  async call(matchId: string, callType: 'voip' | 'phone' = 'voip') {
    console.log('[Mock] 发起通话', { matchId, callType });
    return { call_id: 'call-mock-' + Date.now(), call_status: 'success' };
  },
  async unbind(matchId: string) {
    console.log('[Mock] 解绑', matchId);
  },
  async getBinding(_matchId: string) {
    return {
      id: 'bind-mock',
      match_id: _matchId,
      virtual_number: '4008201100',
      status: 'bound',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      bound_at: new Date().toISOString(),
    } as VirtualPhoneBinding;
  },
  async getCallRecords(_matchId: string) {
    return [
      { call_id: 'call-1', duration_sec: 45, call_status: 'success', started_at: new Date(Date.now() - 300000).toISOString() },
      { call_id: 'call-2', duration_sec: 0, call_status: 'no_answer', started_at: new Date(Date.now() - 600000).toISOString() },
    ] as CallRecord[];
  },
};

// ---- Notifications ----
const _notificationService = {
  list() {
    return api.get<Notification[]>('/notifications');
  },
  markRead(id: string) {
    return api.put(`/notifications/${id}/read`);
  },
  markAllRead() {
    return api.put('/notifications/read-all');
  },
  subscribe(data: Record<string, unknown>) {
    return api.post('/notifications/subscribe', data);
  },
};

// 开发模式 → mock；生产模式 → 真实 API
export const authService = MOCK_ENABLED ? authServiceMock : _authService;
export const helpRequestService = MOCK_ENABLED ? helpRequestServiceMock : _helpRequestService;
export const sosService = MOCK_ENABLED ? sosServiceMock : _sosService;
export const matchService = MOCK_ENABLED ? matchServiceMock : _matchService;
export const dashboardService = MOCK_ENABLED ? dashboardServiceMock : _dashboardService;
export const shelterService = MOCK_ENABLED ? shelterServiceMock : _shelterService;
export const notificationService = MOCK_ENABLED ? notificationServiceMock : _notificationService;
export const callService = MOCK_ENABLED ? callServiceMock : _callService;

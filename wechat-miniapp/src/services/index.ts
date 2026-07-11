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

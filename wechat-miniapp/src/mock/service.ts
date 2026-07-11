// ============================================================
// Mock Service — 模拟后端 API 响应（开发模式下使用）
// 数据来源: docs/html/designer/database/mock-data.sql
// ============================================================
import {
  mockUsers, mockHelpRequests, mockMatches, mockShelters,
  mockAnnouncements, mockRescueUpdates, mockDisasterAlerts,
  mockNotifications, mockLoginResponse,
} from './data';
import type { LoginResponse, User, HelpRequest, Match, Shelter, Announcement, RescueUpdate, DisasterAlert, Notification } from '@/types/models';

// 模拟网络延迟 200-600ms
function delay<T>(data: T, ms = 300): Promise<T> {
  const jitter = Math.random() * 100;
  return new Promise(resolve => setTimeout(() => resolve(data), ms + jitter));
}

// ============ Auth ============
export const authServiceMock = {
  sendOtp(_phone: string) {
    console.log('[Mock] 发送验证码到', _phone, '→ mock 模式下无需真实验证码');
    return delay({ message: '验证码已发送' });
  },
  loginByOtp(phone: string, code: string) {
    console.log('[Mock] OTP 登录', { phone, code });
    // 根据手机号尾号匹配用户
    const masked = '***' + phone.slice(-4);
    const user = mockUsers.find(u => u.phone_masked && u.phone_masked.endsWith(phone.slice(-4))) || mockUsers[0];
    return delay<LoginResponse>({
      token: 'eyJhbGciOiJIUzI1NiJ9.mock_' + user.id,
      user,
    }, 500);
  },
  loginByWx(_data: { js_code: string; encryptedData: string; iv: string }) {
    console.log('[Mock] 微信登录', _data);
    return delay<LoginResponse>({
      token: 'eyJhbGciOiJIUzI1NiJ9.mock_wx_' + mockUsers[0].id,
      user: { ...mockUsers[0], phone_masked: '***6688' },
    }, 500);
  },
};

// ============ Help Requests ============
export const helpRequestServiceMock = {
  create(data: Record<string, unknown>) {
    console.log('[Mock] 创建求助', data);
    const newRequest: HelpRequest = {
      id: 'r' + Date.now().toString(16),
      request_no: 'HR' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 900 + 100)),
      user_id: mockUsers[0].id,
      urgency: (data.urgency as HelpRequest['urgency']) || 'medium',
      route: 'p2p',
      status: 'pending',
      title: (data.title as string) || '未命名求助',
      description: (data.description as string) || '',
      lat: (data.lat as number) || 0,
      lng: (data.lng as number) || 0,
      address: (data.address as string) || '',
      people_count: (data.people_count as number) || 1,
      vulnerable_groups: (data.vulnerable_groups as HelpRequest['vulnerable_groups']) || [],
      is_proxy: (data.is_proxy as boolean) || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // 插入到列表头部
    mockHelpRequests.unshift(newRequest);
    return delay(newRequest, 400);
  },
  list(_params?: Record<string, unknown>) {
    return delay<HelpRequest[]>(mockHelpRequests);
  },
};

// ============ SOS ============
export const sosServiceMock = {
  trigger(_data: { lat: number; lng: number; location_source: string }) {
    console.log('[Mock] SOS 触发', _data);
    return delay({ id: 's' + Date.now().toString(16), status: 'confirmed' }, 200);
  },
};

// ============ Matches ============
export const matchServiceMock = {
  nearby() {
    return delay<Match[]>(mockMatches);
  },
  accept(matchId: string) {
    const m = mockMatches.find(x => x.id === matchId);
    if (m) m.match_status = 'accepted';
    return delay({ ...m, match_status: 'accepted' });
  },
  complete(matchId: string) {
    const m = mockMatches.find(x => x.id === matchId);
    if (m) m.match_status = 'completed';
    return delay({ ...m, match_status: 'completed' });
  },
};

// ============ Dashboard ============
export const dashboardServiceMock = {
  getAnnouncements() {
    return delay<Announcement[]>(mockAnnouncements);
  },
  getRescueUpdates() {
    return delay<RescueUpdate[]>(mockRescueUpdates);
  },
  getAlerts() {
    return delay<DisasterAlert[]>(mockDisasterAlerts);
  },
};

// ============ Shelters ============
export const shelterServiceMock = {
  list() {
    return delay<Shelter[]>(mockShelters);
  },
};

// ============ Notifications ============
export const notificationServiceMock = {
  list() {
    return delay<Notification[]>(mockNotifications);
  },
  markRead(id: string) {
    const n = mockNotifications.find(x => x.id === id);
    if (n) n.is_read = true;
    return delay({ success: true });
  },
  markAllRead() {
    mockNotifications.forEach(n => { n.is_read = true; });
    return delay({ success: true });
  },
  subscribe(_data: Record<string, unknown>) {
    console.log('[Mock] 订阅通知', _data);
    return delay({ success: true });
  },
};

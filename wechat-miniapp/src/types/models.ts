// ============================================================
// 类型定义 — 与后端 schema.sql / Next.js 前端完全对齐
// ============================================================

export type Urgency = 'critical' | 'high' | 'medium' | 'low';
export type RouteType = 'centralized' | 'p2p';
export type TrustTier = 'tier1' | 'tier2' | 'tier3';
export type MatchStatus = 'pending' | 'accepted' | 'enroute' | 'waiting' | 'unreachable' | 'completed' | 'rejected' | 'timeout' | 'escalated';
export type RequestStatus = 'pending' | 'processing' | 'resolved' | 'cancelled';
export type AlertLevel = 'red' | 'orange' | 'yellow' | 'blue';
export type VulGroup = 'elderly' | 'child' | 'pregnant' | 'disabled' | 'chronic';

export interface User {
  id: string;
  wechat_openid?: string;
  phone: string;
  phone_masked?: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'volunteer' | 'citizen' | 'guest';
  avatar_url?: string;
  last_known_lat?: number;
  last_known_lng?: number;
  status: 'active' | 'frozen' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface HelpRequest {
  id: string;
  request_no: string;
  user_id?: string;
  guest_phone?: string;
  urgency: Urgency;
  route: RouteType;
  status: RequestStatus;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  address?: string;
  people_count?: number;
  vulnerable_groups?: VulGroup[];
  is_proxy: boolean;
  area_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  help_request_id: string;
  volunteer_id: string;
  match_score: number;
  match_status: MatchStatus;
  route: RouteType;
  location_sharing_enabled?: boolean;
  accepted_at?: string;
  completed_at?: string;
  help_request?: HelpRequest;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  current_occupancy: number;
  status: string;
  contact_phone?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  level: AlertLevel;
  is_pinned: boolean;
  published_at: string;
}

export interface RescueUpdate {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
}

export interface DisasterAlert {
  id: string;
  level: AlertLevel;
  title: string;
  description?: string;
  area_ids: string[];
  issued_at: string;
  is_active: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  notification_type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  user: User;
}

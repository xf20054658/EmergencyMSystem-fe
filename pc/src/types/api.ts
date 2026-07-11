// ============================================================
// API 通用类型
// ============================================================

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    page_size: number;
  };
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface LoginRequest {
  phone?: string;
  email?: string;
  password?: string;
  wechat_code?: string;
  otp_code?: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: import('./models').User;
}

export interface WebSocketMessage {
  type: 'new_request' | 'match_update' | 'escalation_alert' | 'gps_update' | 'alert_broadcast' | 'system';
  payload: Record<string, unknown>;
  timestamp: string;
}

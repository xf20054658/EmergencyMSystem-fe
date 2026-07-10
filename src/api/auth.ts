// ============================================================
// 认证 API
// ============================================================

import { post, get } from './client';
import type { LoginRequest, LoginResponse } from '@/types/api';
import type { User } from '@/types/models';

export const authApi = {
  /** 手机号 + 密码登录 */
  login: (data: LoginRequest) =>
    post<LoginResponse>('/auth/login', data as unknown as Record<string, unknown>),

  /** 发送 OTP 验证码 */
  sendOtp: (phone: string) =>
    post<{ expire_sec: number }>('/auth/otp/send', { phone }),

  /** OTP 验证码登录 */
  loginByOtp: (phone: string, otpCode: string) =>
    post<LoginResponse>('/auth/otp/verify', { phone, otp_code: otpCode }),

  /** 微信登录 */
  loginByWechat: (code: string) =>
    post<LoginResponse>('/auth/wechat/login', { code }),

  /** 游客模式创建求助（无需登录） */
  guestRequest: (data: { phone: string; name?: string }) =>
    post<{ guest_token: string }>('/auth/guest', data as unknown as Record<string, unknown>),

  /** 注册后合并游客数据 */
  mergeGuest: (phone: string) =>
    post<{ merged_count: number }>('/auth/merge-guest', { phone }),

  /** 获取当前用户信息 */
  getProfile: () =>
    get<User>('/auth/profile'),

  /** 刷新 Token */
  refreshToken: () =>
    post<LoginResponse>('/auth/refresh'),

  /** 退出登录 */
  logout: () =>
    post<void>('/auth/logout'),

  /** 注册 */
  register: (data: {
    phone: string;
    password: string;
    name: string;
    role?: string;
  }) =>
    post<LoginResponse>('/auth/register', data as unknown as Record<string, unknown>),

  /** 忘记密码 */
  forgotPassword: (phone: string) =>
    post<{ message: string }>('/auth/forgot-password', { phone }),

  /** 重置密码 */
  resetPassword: (phone: string, otpCode: string, newPassword: string) =>
    post<{ message: string }>('/auth/reset-password', {
      phone,
      otp_code: otpCode,
      new_password: newPassword,
    }),
};

// ============================================================
// API Client — 基于 Taro.request 封装
// ============================================================
import Taro from '@tarojs/taro';
import { getToken, removeToken, removeUser } from '@/utils/auth';
import type { ApiResponse } from '@/types/models';

// 后端地址：开发环境指向本地/局域网
const API_BASE = 'http://localhost:8080/api/v1';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  skipAuth?: boolean;
}

async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, skipAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return new Promise<T>((resolve, reject) => {
    Taro.request<ApiResponse<T>>({
      url: `${API_BASE}${url}`,
      method,
      data,
      header: headers,
      timeout: 15000,
      success(res) {
        if (res.statusCode === 401) {
          removeToken();
          removeUser();
          reject(new Error('登录已过期，请重新登录'));
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data.data);
        } else {
          const msg = res.data?.message || `请求失败 (${res.statusCode})`;
          reject(new Error(msg));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
}

export const api = {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return request<T>({ url: url + query, method: 'GET' });
  },

  post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    return request<T>({ url, method: 'POST', data });
  },

  put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
    return request<T>({ url, method: 'PUT', data });
  },

  del<T>(url: string): Promise<T> {
    return request<T>({ url, method: 'DELETE' });
  },
};

export default api;

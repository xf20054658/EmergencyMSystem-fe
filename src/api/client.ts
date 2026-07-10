// ============================================================
// API Client — Axios 封装，自动携带 JWT Token
// ============================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types';

const API_BASE = '/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动附加 JWT
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器：统一错误处理
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // 跳转到登录页（避免循环重定向）
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;

// ============================================================
// 便捷请求方法
// ============================================================

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await client.get<ApiResponse<T>>(url, { params });
  return res.data.data;
}

export async function post<T>(url: string, data?: Record<string, unknown>): Promise<T> {
  const res = await client.post<ApiResponse<T>>(url, data);
  return res.data.data;
}

export async function put<T>(url: string, data?: Record<string, unknown>): Promise<T> {
  const res = await client.put<ApiResponse<T>>(url, data);
  return res.data.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await client.delete<ApiResponse<T>>(url);
  return res.data.data;
}

export async function getPaginated<T>(url: string, params?: Record<string, unknown>): Promise<{
  items: T[];
  total: number;
  page: number;
  page_size: number;
}> {
  const res = await client.get<ApiResponse<{ items: T[]; total: number; page: number; page_size: number }>>(url, { params });
  return res.data.data;
}

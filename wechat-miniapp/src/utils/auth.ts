// ============================================================
// Auth 工具 — Taro 存储版
// ============================================================
import Taro from '@tarojs/taro';
import type { User } from '@/types/models';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token);
}

export function removeToken(): void {
  Taro.removeStorageSync(TOKEN_KEY);
}

export function getUser(): User | null {
  try {
    const raw = Taro.getStorageSync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  Taro.setStorageSync(USER_KEY, JSON.stringify(user));
}

export function removeUser(): void {
  Taro.removeStorageSync(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!(getToken() && getUser());
}

export function login(token: string, user: User): void {
  setToken(token);
  setUser(user);
}

export function logout(): void {
  removeToken();
  removeUser();
}

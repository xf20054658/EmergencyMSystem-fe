'use client';

// ============================================================
// PC 登录页 — 手机号/邮箱 + 密码 + OTP 验证码
// ============================================================

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api';

export function PCLoginView() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'password') {
        if (!phone || !password) { setError('请输入手机号和密码'); setLoading(false); return; }
        res = await authApi.login({ phone, password });
      } else {
        if (!otpCode) { setError('请输入验证码'); setLoading(false); return; }
        res = await authApi.loginByOtp(phone, otpCode);
      }
      login(res.token, res.user);
    } catch {
      setError(mode === 'password' ? '手机号或密码错误' : '验证码错误或已过期');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) { setError('请输入手机号'); return; }
    try {
      await authApi.sendOtp(phone);
      setOtpSent(true);
      setError('');
    } catch {
      setError('验证码发送失败');
    }
  };

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
      <div className="w-[400px] bg-terminal-card border border-terminal-border rounded-lg p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-terminal-accent text-3xl mb-2">◉</div>
          <h1 className="text-terminal-text text-lg font-semibold">应急指挥中心</h1>
          <p className="text-terminal-muted text-xs mt-1">广西洪涝灾害应急管理平台 v2.1</p>
        </div>

        {/* Mode Switch */}
        <div className="flex mb-6 bg-terminal-bg rounded-lg p-0.5">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'password' ? 'bg-terminal-accent text-black' : 'text-terminal-muted'}`}
          >
            密码登录
          </button>
          <button
            onClick={() => { setMode('otp'); setOtpSent(false); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${mode === 'otp' ? 'bg-terminal-accent text-black' : 'text-terminal-muted'}`}
          >
            验证码登录
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-terminal-muted text-xs mb-1.5 uppercase tracking-wider">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full bg-terminal-bg border border-terminal-border rounded-md px-3 py-2.5 text-terminal-text text-sm outline-none focus:border-terminal-accent transition-colors"
            />
          </div>

          {mode === 'password' ? (
            <div>
              <label className="block text-terminal-muted text-xs mb-1.5 uppercase tracking-wider">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full bg-terminal-bg border border-terminal-border rounded-md px-3 py-2.5 text-terminal-text text-sm outline-none focus:border-terminal-accent transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-terminal-muted text-xs mb-1.5 uppercase tracking-wider">验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6位验证码"
                  className="flex-1 bg-terminal-bg border border-terminal-border rounded-md px-3 py-2.5 text-terminal-text text-sm outline-none focus:border-terminal-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!phone}
                  className="px-4 py-2.5 bg-terminal-bg border border-terminal-border rounded-md text-terminal-accent text-xs whitespace-nowrap hover:border-terminal-accent transition-colors disabled:opacity-50"
                >
                  {otpSent ? '重新发送' : '获取验证码'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 rounded-md px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-terminal-accent text-black rounded-md text-sm font-semibold hover:bg-terminal-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-4 text-center text-terminal-muted text-xs">
          仅供授权人员使用 · 请妥善保管账号
        </div>
      </div>
    </div>
  );
}

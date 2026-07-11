'use client';

// ============================================================
// Mobile 我的 — 个人中心 / 登录
// ============================================================

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api';

export function MobileProfileView() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [logging, setLogging] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 11) {
      alert('请输入正确的手机号');
      return;
    }
    try {
      await authApi.sendOtp(phone);
      setOtpSent(true);
      alert('验证码已发送');
    } catch {
      alert('发送失败');
    }
  };

  const handleLogin = async () => {
    if (!otpCode) { alert('请输入验证码'); return; }
    setLogging(true);
    try {
      const res = await authApi.loginByOtp(phone, otpCode);
      login(res.token, res.user);
      setShowLogin(false);
      setPhone('');
      setOtpCode('');
      setOtpSent(false);
    } catch {
      alert('登录失败，请检查验证码');
    } finally {
      setLogging(false);
    }
  };

  if (!isAuthenticated || showLogin) {
    return (
      <div className="p-4 pb-24">
        <h1 className="text-ios-text text-xl font-bold pt-2 mb-6">登录</h1>
        <div className="ios-card space-y-4">
          <div className="text-center mb-2">
            <div className="text-ios-text text-lg font-semibold">应急互助平台</div>
            <div className="text-ios-muted text-sm mt-1">手机号快速登录</div>
          </div>

          <div>
            <label className="text-ios-text text-sm font-medium">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full bg-ios-bg rounded-lg px-3 py-2.5 text-ios-text text-sm mt-1.5 outline-none"
            />
          </div>

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              className="w-full py-3 bg-ios-blue text-white rounded-xl text-sm font-semibold"
            >
              获取验证码
            </button>
          ) : (
            <>
              <div>
                <label className="text-ios-text text-sm font-medium">验证码</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="请输入验证码"
                  className="w-full bg-ios-bg rounded-lg px-3 py-2.5 text-ios-text text-sm mt-1.5 outline-none"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={logging}
                className="w-full py-3 bg-ios-green text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {logging ? '登录中...' : '登录'}
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtpCode(''); }}
                className="w-full text-ios-muted text-sm"
              >
                重新发送验证码
              </button>
            </>
          )}

          <button
            onClick={() => setShowLogin(false)}
            className="w-full text-ios-muted text-sm"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // Authenticated Profile View
  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Avatar + Name */}
      <div className="ios-card flex items-center gap-4 pt-2">
        <div className="w-16 h-16 bg-ios-blue/10 rounded-full flex items-center justify-center text-3xl">
          👤
        </div>
        <div>
          <div className="text-ios-text text-lg font-semibold">{user?.name || '用户'}</div>
          <div className="text-ios-muted text-sm">{user?.phone_masked || user?.phone}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="ios-card grid grid-cols-3 divide-x divide-ios-separator">
        <div className="text-center">
          <div className="text-ios-blue text-lg font-bold">0</div>
          <div className="text-ios-muted text-xs">我的求助</div>
        </div>
        <div className="text-center">
          <div className="text-ios-green text-lg font-bold">0</div>
          <div className="text-ios-muted text-xs">已帮助</div>
        </div>
        <div className="text-center">
          <div className="text-ios-orange text-lg font-bold">0</div>
          <div className="text-ios-muted text-xs">信任分</div>
        </div>
      </div>

      {/* Menu */}
      <div className="ios-card space-y-0.5">
        <MenuItem icon="📋" label="我的上报" />
        <MenuItem icon="🤝" label="我的帮忙记录" />
        <MenuItem icon="⭐" label="我的评价" />
        <MenuItem icon="⚙️" label="通知偏好" />
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-sm font-medium"
      >
        退出登录
      </button>
    </div>
  );
}

function MenuItem({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 py-3 border-b border-ios-separator/50 last:border-0 text-sm text-ios-text hover:bg-ios-bg/50 transition-colors rounded-lg px-2">
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      <span className="ml-auto text-ios-muted">›</span>
    </button>
  );
}

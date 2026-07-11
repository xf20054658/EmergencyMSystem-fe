// ============================================================
// 个人中心 — 微信登录 / 手机号登录 / 资料 / 退出
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, Input, Button, Navigator } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { authService } from '@/services';
import * as auth from '@/utils/auth';
import { maskPhone } from '@/utils/helpers';
import type { User } from '@/types/models';
import './profile.scss';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showWxLogin, setShowWxLogin] = useState(false); // 是否显示微信登录弹窗
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [logging, setLogging] = useState(false);
  const [wxLogging, setWxLogging] = useState(false);

  useEffect(() => {
    const u = auth.getUser();
    const t = auth.getToken();
    if (u && t) {
      setUser(u);
      setIsAuth(true);
    }
  }, []);

  // --- 微信登录 ---
  const handleGetPhoneNumber = async (e: any) => {
    const { errMsg, encryptedData, iv } = e.detail;
    if (errMsg !== 'getPhoneNumber:ok') {
      Taro.showToast({ title: '请授权获取手机号', icon: 'none' });
      return;
    }
    setWxLogging(true);
    try {
      // 获取 js_code
      const loginRes = await Taro.login();
      // 调用后端微信登录
      const res = await authService.loginByWx({
        js_code: loginRes.code,
        encryptedData,
        iv,
      });
      // 确保手机号脱敏
      const userWithMasked = {
        ...res.user,
        phone_masked: res.user.phone_masked || maskPhone(res.user.phone),
      };
      auth.login(res.token, userWithMasked);
      setUser(userWithMasked);
      setIsAuth(true);
      setShowWxLogin(false);
      setShowLogin(false);
      Taro.showToast({ title: '登录成功', icon: 'success' });
    } catch {
      Taro.showToast({ title: '微信登录失败，请重试', icon: 'none' });
    } finally {
      setWxLogging(false);
    }
  };

  // --- 手机号验证码登录 ---
  const handleSendOtp = async () => {
    if (!phone || phone.length < 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    try {
      await authService.sendOtp(phone);
      setOtpSent(true);
      Taro.showToast({ title: '验证码已发送', icon: 'success' });
    } catch {
      Taro.showToast({ title: '发送失败', icon: 'none' });
    }
  };

  const handleLogin = async () => {
    if (!otpCode) { Taro.showToast({ title: '请输入验证码', icon: 'none' }); return; }
    setLogging(true);
    try {
      const res = await authService.loginByOtp(phone, otpCode);
      const userWithMasked = {
        ...res.user,
        phone_masked: res.user.phone_masked || maskPhone(res.user.phone),
      };
      auth.login(res.token, userWithMasked);
      setUser(userWithMasked);
      setIsAuth(true);
      setShowLogin(false);
      setPhone('');
      setOtpCode('');
      setOtpSent(false);
      Taro.showToast({ title: '登录成功', icon: 'success' });
    } catch {
      Taro.showToast({ title: '登录失败，请检查验证码', icon: 'none' });
    } finally {
      setLogging(false);
    }
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success(res) {
        if (res.confirm) {
          auth.logout();
          setUser(null);
          setIsAuth(false);
        }
      },
    });
  };

  // --- 微信登录引导弹窗 ---
  if (showWxLogin) {
    return (
      <View className="page-profile safe-bottom">
        <View className="auth-container">
          <Text className="auth-title">微信登录</Text>
          <View className="auth-card">
            <View className="auth-brand">
              <Text className="auth-brand__icon--large">🔒</Text>
              <Text className="auth-brand__name">授权获取手机号</Text>
              <Text className="auth-brand__sub">点击按钮授权微信获取您的手机号，用于登录和救援联系</Text>
            </View>
            <Button
              className="btn-wx-login"
              openType="getPhoneNumber"
              onGetPhoneNumber={handleGetPhoneNumber}
              loading={wxLogging}
            >
              {wxLogging ? '登录中...' : '微信一键登录'}
            </Button>
            <View className="back-link" onClick={() => setShowWxLogin(false)}>
              <Text className="text-muted">返回</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // --- 手机号验证码登录 ---
  if (!isAuth && showLogin) {
    return (
      <View className="page-profile safe-bottom">
        <View className="auth-container">
          <Text className="auth-title">登录</Text>
          <View className="auth-card">
            <View className="auth-brand">
              <Text className="auth-brand__icon">🌊</Text>
              <Text className="auth-brand__name">洪涝应急</Text>
              <Text className="auth-brand__sub">手机号快速登录</Text>
            </View>

            <View className="form-group">
              <Text className="form-label">手机号</Text>
              <Input
                className="input-field"
                type="number"
                placeholder="请输入手机号"
                value={phone}
                onInput={e => setPhone(e.detail.value)}
                maxlength={11}
              />
            </View>

            {!otpSent ? (
              <Button className="btn-send" onClick={handleSendOtp}>
                获取验证码
              </Button>
            ) : (
              <>
                <View className="form-group">
                  <Text className="form-label">验证码</Text>
                  <Input
                    className="input-field"
                    type="number"
                    placeholder="请输入验证码"
                    value={otpCode}
                    onInput={e => setOtpCode(e.detail.value)}
                    maxlength={6}
                  />
                </View>
                <Button className="btn-login" onClick={handleLogin} loading={logging}>
                  {logging ? '登录中...' : '登录'}
                </Button>
                <View className="resend-link" onClick={() => { setOtpSent(false); setOtpCode(''); }}>
                  <Text className="text-blue">重新发送验证码</Text>
                </View>
              </>
            )}

            <View className="back-link" onClick={() => setShowLogin(false)}>
              <Text className="text-muted">返回</Text>
            </View>

            {/* 用户协议 */}
            <View className="agreement-row">
              <Text className="text-muted text-sm">登录即表示同意</Text>
              <Text className="text-sm text-blue">《用户协议》</Text>
              <Text className="text-muted text-sm">和</Text>
              <Text className="text-sm text-blue">《隐私政策》</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // --- 未登录主页面 ---
  if (!isAuth) {
    return (
      <View className="page-profile safe-bottom">
        <View className="auth-container">
          <Text className="auth-title">我的</Text>
          <View className="auth-card">
            <View className="auth-brand">
              <Text className="auth-brand__icon--large">👤</Text>
              <Text className="auth-brand__name">登录后查看更多信息</Text>
              <Text className="auth-brand__sub">同步您的求助与帮忙记录</Text>
            </View>
            {/* 微信一键登录（主按钮） */}
            <Button
              className="btn-wx-login"
              openType="getPhoneNumber"
              onGetPhoneNumber={handleGetPhoneNumber}
              loading={wxLogging}
            >
              {wxLogging ? '登录中...' : '微信一键登录'}
            </Button>
            {/* 手机号登录（次按钮） */}
            <Button className="btn-login-secondary" onClick={() => setShowLogin(true)}>
              手机号验证码登录
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // --- 已登录 ---
  const displayPhone = user?.phone_masked || maskPhone(user?.phone || '');

  return (
    <View className="page-profile safe-bottom">
      {/* 头像 + 信息 */}
      <View className="profile-card">
        <View className="profile-avatar">
          <Text className="profile-avatar__icon">👤</Text>
        </View>
        <View className="profile-info">
          <Text className="profile-name">{user?.name || '用户'}</Text>
          <Text className="profile-phone">{displayPhone}</Text>
        </View>
      </View>

      {/* 统计 */}
      <View className="stats-card">
        <View className="stat-item">
          <Text className="stat-value text-blue">0</Text>
          <Text className="stat-label">我的求助</Text>
        </View>
        <View className="stat-divider" />
        <View className="stat-item">
          <Text className="stat-value text-green">0</Text>
          <Text className="stat-label">已帮助</Text>
        </View>
        <View className="stat-divider" />
        <View className="stat-item">
          <Text className="stat-value" style={{ color: '#FF9500' }}>0</Text>
          <Text className="stat-label">信任分</Text>
        </View>
      </View>

      {/* 菜单 */}
      <View className="menu-card">
        <Navigator url="/pages/myreports/myreports" className="menu-item">
          <Text className="menu-icon">📋</Text>
          <Text className="menu-label">我的上报</Text>
          <Text className="menu-arrow">›</Text>
        </Navigator>
        <Navigator url="/pages/notifications/notifications" className="menu-item">
          <Text className="menu-icon">🔔</Text>
          <Text className="menu-label">通知中心</Text>
          <Text className="menu-arrow">›</Text>
        </Navigator>
        <Navigator url="/pages/preferences/preferences" className="menu-item menu-item--last">
          <Text className="menu-icon">⚙️</Text>
          <Text className="menu-label">通知偏好</Text>
          <Text className="menu-arrow">›</Text>
        </Navigator>
      </View>

      {/* 退出 */}
      <Button className="logout-btn" onClick={handleLogout}>退出登录</Button>
    </View>
  );
}

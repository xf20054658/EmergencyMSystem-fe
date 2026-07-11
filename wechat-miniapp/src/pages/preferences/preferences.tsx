// ============================================================
// 通知偏好 — 推送 / 震动 / 免打扰
// ============================================================
import React, { useState } from 'react';
import { View, Text, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import TabBar from '@/components/TabBar';
import './preferences.scss';

export default function PreferencesPage() {
  const [newMatch, setNewMatch] = useState(true);
  const [matchConfirmed, setMatchConfirmed] = useState(true);
  const [statusChange, setStatusChange] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);

  const handleSwitch = (key: string, val: boolean) => {
    const setters: Record<string, (v: boolean) => void> = {
      newMatch: setNewMatch,
      matchConfirmed: setMatchConfirmed,
      statusChange: setStatusChange,
      sound: setSound,
      vibrate: setVibrate,
    };
    setters[key]?.(val);
    Taro.showToast({ title: '设置已保存', icon: 'success', duration: 1000 });
  };

  return (
    <View className="page-preferences safe-bottom">
      <View className="pref-section">
        <Text className="pref-section__title">消息通知</Text>
        <View className="pref-item">
          <View className="pref-item__info">
            <Text className="pref-item__label">新匹配提醒</Text>
            <Text className="pref-item__desc">有志愿者匹配您的求助时通知</Text>
          </View>
          <Switch
            checked={newMatch}
            color="#007AFF"
            onChange={e => handleSwitch('newMatch', e.detail.value)}
          />
        </View>
        <View className="pref-item">
          <View className="pref-item__info">
            <Text className="pref-item__label">匹配确认通知</Text>
            <Text className="pref-item__desc">志愿者确认接受任务时通知</Text>
          </View>
          <Switch
            checked={matchConfirmed}
            color="#007AFF"
            onChange={e => handleSwitch('matchConfirmed', e.detail.value)}
          />
        </View>
        <View className="pref-item pref-item--last">
          <View className="pref-item__info">
            <Text className="pref-item__label">状态变更通知</Text>
            <Text className="pref-item__desc">求助状态更新时通知</Text>
          </View>
          <Switch
            checked={statusChange}
            color="#007AFF"
            onChange={e => handleSwitch('statusChange', e.detail.value)}
          />
        </View>
      </View>

      <View className="pref-section">
        <Text className="pref-section__title">提醒方式</Text>
        <View className="pref-item">
          <View className="pref-item__info">
            <Text className="pref-item__label">声音</Text>
            <Text className="pref-item__desc">收到通知时播放提示音</Text>
          </View>
          <Switch
            checked={sound}
            color="#007AFF"
            onChange={e => handleSwitch('sound', e.detail.value)}
          />
        </View>
        <View className="pref-item pref-item--last">
          <View className="pref-item__info">
            <Text className="pref-item__label">震动</Text>
            <Text className="pref-item__desc">收到通知时手机震动</Text>
          </View>
          <Switch
            checked={vibrate}
            color="#007AFF"
            onChange={e => handleSwitch('vibrate', e.detail.value)}
          />
        </View>
      </View>

      <TabBar />
    </View>
  );
}

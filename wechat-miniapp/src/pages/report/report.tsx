// ============================================================
// 求助上报 — 自助求助 / 代他人上报 / 特殊群体
// ============================================================
import React, { useState } from 'react';
import { View, Text, Input, Textarea, Picker, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { helpRequestService } from '@/services';
import './report.scss';

const URGENCY_OPTIONS = ['low', 'medium', 'high', 'critical'] as const;
const URGENCY_LABELS: Record<string, string> = {
  low: 'IV级 一般',
  medium: 'III级 较大',
  high: 'II级 重大',
  critical: 'I级 特大',
};
const VUL_OPTIONS = [
  { value: 'elderly', label: '老人' },
  { value: 'child', label: '儿童' },
  { value: 'pregnant', label: '孕妇' },
  { value: 'disabled', label: '残障人士' },
  { value: 'chronic', label: '慢性病患者' },
];

export default function ReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [peopleCount, setPeopleCount] = useState('1');
  const [address, setAddress] = useState('');
  const [vulGroups, setVulGroups] = useState<string[]>([]);
  const [isProxy, setIsProxy] = useState(false);
  const [proxyName, setProxyName] = useState('');
  const [proxyPhone, setProxyPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleVulGroup = (val: string) => {
    setVulGroups(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入求助标题', icon: 'none' });
      return;
    }
    if (!address.trim()) {
      Taro.showToast({ title: '请输入地址', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      // 获取位置
      let lat = 0;
      let lng = 0;
      try {
        const loc = await new Promise<Taro.getLocation.SuccessCallbackResult>((resolve, reject) => {
          Taro.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,
            success: resolve,
            fail: reject,
          });
        });
        lat = loc.latitude;
        lng = loc.longitude;
      } catch {
        const lastLat = Taro.getStorageSync('last_known_lat');
        const lastLng = Taro.getStorageSync('last_known_lng');
        if (lastLat && lastLng) {
          lat = Number(lastLat);
          lng = Number(lastLng);
        }
      }

      await helpRequestService.create({
        title: title.trim(),
        description: description.trim(),
        urgency,
        people_count: parseInt(peopleCount) || 1,
        lat,
        lng,
        address: address.trim(),
        vulnerable_groups: vulGroups.length > 0 ? vulGroups : undefined,
        is_proxy: isProxy,
        proxy_name: isProxy ? proxyName.trim() : undefined,
        proxy_phone: isProxy ? proxyPhone.trim() : undefined,
      });

      Taro.showToast({ title: '求助已提交', icon: 'success' });

      // 重置表单
      setTitle('');
      setDescription('');
      setUrgency('medium');
      setPeopleCount('1');
      setAddress('');
      setVulGroups([]);
      setIsProxy(false);
      setProxyName('');
      setProxyPhone('');
    } catch (e: unknown) {
      Taro.showToast({ title: (e as Error).message || '提交失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView scrollY className="page-report safe-bottom">
      <View className="form-container">
        <Text className="form-title">求助上报</Text>

        {/* 标题 */}
        <View className="form-group">
          <Text className="form-label">求助标题 *</Text>
          <Input
            className="input-field"
            placeholder="简要描述您的需求"
            value={title}
            onInput={e => setTitle(e.detail.value)}
            maxlength={100}
          />
        </View>

        {/* 紧急程度 */}
        <View className="form-group">
          <Text className="form-label">紧急程度</Text>
          <View className="urgency-selector">
            {URGENCY_OPTIONS.map(opt => (
              <View
                key={opt}
                className={`urgency-option ${urgency === opt ? 'urgency-option--active' : ''}`}
                onClick={() => setUrgency(opt)}
              >
                <Text>{URGENCY_LABELS[opt]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 人数 */}
        <View className="form-group">
          <Text className="form-label">涉及人数</Text>
          <Input
            className="input-field"
            type="number"
            placeholder="1"
            value={peopleCount}
            onInput={e => setPeopleCount(e.detail.value)}
          />
        </View>

        {/* 地址 */}
        <View className="form-group">
          <Text className="form-label">地址 *</Text>
          <Input
            className="input-field"
            placeholder="如：南宁市青秀区XX街道"
            value={address}
            onInput={e => setAddress(e.detail.value)}
          />
        </View>

        {/* 描述 */}
        <View className="form-group">
          <Text className="form-label">详细描述</Text>
          <Textarea
            className="textarea-field"
            placeholder="描述具体情况和需要什么帮助..."
            value={description}
            onInput={e => setDescription(e.detail.value)}
            maxlength={500}
            autoHeight
          />
        </View>

        {/* 特殊群体 */}
        <View className="form-group">
          <Text className="form-label">特殊群体标记</Text>
          <View className="vul-selector">
            {VUL_OPTIONS.map(opt => (
              <View
                key={opt.value}
                className={`vul-tag ${vulGroups.includes(opt.value) ? 'vul-tag--active' : ''}`}
                onClick={() => toggleVulGroup(opt.value)}
              >
                <Text>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 代报开关 */}
        <View className="form-group">
          <View className="switch-row">
            <Text className="form-label">代他人上报</Text>
            <View
              className={`switch ${isProxy ? 'switch--on' : ''}`}
              onClick={() => setIsProxy(!isProxy)}
            >
              <View className="switch-handle" />
            </View>
          </View>
        </View>

        {isProxy && (
          <>
            <View className="form-group">
              <Text className="form-label">被代人姓名</Text>
              <Input
                className="input-field"
                placeholder="输入被代报人姓名"
                value={proxyName}
                onInput={e => setProxyName(e.detail.value)}
              />
            </View>
            <View className="form-group">
              <Text className="form-label">被代人手机号</Text>
              <Input
                className="input-field"
                type="number"
                placeholder="输入被代报人手机号"
                value={proxyPhone}
                onInput={e => setProxyPhone(e.detail.value)}
                maxlength={11}
              />
            </View>
          </>
        )}

        {/* 提交 */}
        <Button
          className="submit-btn"
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '提交求助'}
        </Button>
      </View>
    </ScrollView>
  );
}

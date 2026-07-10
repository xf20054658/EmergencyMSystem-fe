'use client';

// ============================================================
// Mobile 求助上报 — 提交求助 + 代报功能
// ============================================================

import React, { useState } from 'react';
import { helpRequestApi } from '@/api';
import { VUL_GROUP_LABELS } from '@/lib/constants';
import type { VulGroup } from '@/types/models';

export function MobileReportView() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency: 'medium' as string,
    lat: 22.817,
    lng: 108.366,
    address: '',
    people_count: 1,
    vulnerable_groups: [] as string[],
    // Proxy
    is_proxy: false,
    proxy_name: '',
    proxy_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('请输入求助标题');
      return;
    }
    setSubmitting(true);
    try {
      const data: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        urgency: form.urgency,
        lat: form.lat,
        lng: form.lng,
        address: form.address,
        people_count: form.people_count,
        vulnerable_groups: form.vulnerable_groups.length > 0 ? form.vulnerable_groups : undefined,
        is_proxy: form.is_proxy,
        proxy_name: form.is_proxy ? form.proxy_name : undefined,
        proxy_phone: form.is_proxy ? form.proxy_phone : undefined,
      };

      if (form.is_proxy) {
        await helpRequestApi.proxyReport(data as any);
      } else {
        await helpRequestApi.create(data as any);
      }
      alert('求助已提交，系统正在匹配救援力量');
      // Reset
      setForm((f) => ({ ...f, title: '', description: '', people_count: 1, vulnerable_groups: [], is_proxy: false, proxy_name: '', proxy_phone: '' }));
    } catch (err) {
      console.error('Submit error:', err);
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVulGroup = (g: string) => {
    setForm((f) => ({
      ...f,
      vulnerable_groups: f.vulnerable_groups.includes(g)
        ? f.vulnerable_groups.filter((v) => v !== g)
        : [...f.vulnerable_groups, g],
    }));
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <h1 className="text-ios-text text-xl font-bold pt-2">求助上报</h1>

      <div className="ios-card space-y-3">
        <FormField label="求助标题" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="简要描述您需要的帮助"
            className="w-full bg-ios-bg rounded-lg px-3 py-2.5 text-ios-text text-sm outline-none"
          />
        </FormField>

        <FormField label="详细描述">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="请详细描述情况..."
            rows={3}
            className="w-full bg-ios-bg rounded-lg px-3 py-2.5 text-ios-text text-sm outline-none resize-none"
          />
        </FormField>

        <FormField label="紧急程度">
          <div className="flex gap-2">
            {[
              { value: 'critical', label: 'Ⅰ 特大', color: 'bg-red-500' },
              { value: 'high', label: 'Ⅱ 重大', color: 'bg-orange-500' },
              { value: 'medium', label: 'Ⅲ 较大', color: 'bg-yellow-500' },
              { value: 'low', label: 'Ⅳ 一般', color: 'bg-blue-500' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, urgency: opt.value }))}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
                  ${form.urgency === opt.value ? `${opt.color} text-white` : 'bg-ios-bg text-ios-muted'}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="地址">
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="输入地址或自动定位"
            className="w-full bg-ios-bg rounded-lg px-3 py-2.5 text-ios-text text-sm outline-none"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="受困人数">
            <input
              type="number"
              min={1}
              value={form.people_count}
              onChange={(e) => setForm((f) => ({ ...f, people_count: parseInt(e.target.value) || 1 }))}
              className="w-full bg-ios-bg rounded-lg px-3 py-2.5 text-ios-text text-sm outline-none"
            />
          </FormField>
        </div>

        {/* Vulnerable Groups */}
        <FormField label="特殊群体 (可多选)">
          <div className="flex flex-wrap gap-2">
            {Object.entries(VUL_GROUP_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleVulGroup(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${form.vulnerable_groups.includes(key)
                    ? 'bg-yellow-500 text-white'
                    : 'bg-ios-bg text-ios-muted'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </FormField>

        {/* Proxy Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-ios-text text-sm">代他人上报</span>
          <button
            onClick={() => setForm((f) => ({ ...f, is_proxy: !f.is_proxy }))}
            className={`w-11 h-6 rounded-full transition-colors ${form.is_proxy ? 'bg-ios-green' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_proxy ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {form.is_proxy && (
          <>
            <FormField label="被代报人姓名">
              <input
                type="text"
                value={form.proxy_name}
                onChange={(e) => setForm((f) => ({ ...f, proxy_name: e.target.value }))}
                placeholder="被代报人的真实姓名"
                className="w-full bg-ios-bg rounded-lg px-3 py-2.5 text-ios-text text-sm outline-none"
              />
            </FormField>
            <FormField label="被代报人手机号">
              <input
                type="tel"
                value={form.proxy_phone}
                onChange={(e) => setForm((f) => ({ ...f, proxy_phone: e.target.value }))}
                placeholder="被代报人的手机号"
                className="w-full bg-ios-bg rounded-lg px-3 py-2.5 text-ios-text text-sm outline-none"
              />
            </FormField>
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3.5 bg-ios-red text-white rounded-xl text-base font-semibold disabled:opacity-50 transition-opacity"
      >
        {submitting ? '提交中...' : '提交求助'}
      </button>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-ios-text text-sm font-medium mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

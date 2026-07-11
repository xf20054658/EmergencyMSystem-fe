'use client';

// ============================================================
// View 4: 灾情地图 — 广西地图 + 交互弹窗 + 图层切换
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { HelpRequest, Shelter } from '@/types/models';

// 广西 14 城市坐标
const GUANGXI_CITIES = [
  { name: '南宁', lat: 22.817, lng: 108.366 },
  { name: '柳州', lat: 24.326, lng: 109.428 },
  { name: '桂林', lat: 25.274, lng: 110.290 },
  { name: '梧州', lat: 23.477, lng: 111.279 },
  { name: '北海', lat: 21.473, lng: 109.119 },
  { name: '防城港', lat: 21.687, lng: 108.355 },
  { name: '钦州', lat: 21.981, lng: 108.654 },
  { name: '贵港', lat: 23.111, lng: 109.599 },
  { name: '玉林', lat: 22.654, lng: 110.181 },
  { name: '百色', lat: 23.902, lng: 106.618 },
  { name: '贺州', lat: 24.404, lng: 111.567 },
  { name: '河池', lat: 24.693, lng: 108.085 },
  { name: '来宾', lat: 23.750, lng: 109.221 },
  { name: '崇左', lat: 22.377, lng: 107.365 },
];

const LON_RANGE = [104.5, 112.0];
const LAT_RANGE = [20.9, 26.4];

function toSvgX(lng: number) { return ((lng - LON_RANGE[0]) / (LON_RANGE[1] - LON_RANGE[0])) * 100; }
function toSvgY(lat: number) { return 100 - ((lat - LAT_RANGE[0]) / (LAT_RANGE[1] - LAT_RANGE[0])) * 100; }

type SelectedItem = {
  type: 'request' | 'shelter' | 'volunteer';
  data: HelpRequest | Shelter | { id: string; name: string; lat: number; lng: number; tier: string };
};

export function DisasterMapView() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [volunteers, setVolunteers] = useState<{ id: string; name: string; lat: number; lng: number; tier: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // 图层切换
  const [layers, setLayers] = useState({ requests: true, shelters: true, volunteers: true });

  useEffect(() => {
    async function load() {
      try {
        const data = await dashboardApi.getMapData();
        setRequests(data.requests);
        setShelters(data.shelters);
        setVolunteers(data.volunteers);
      } catch (err) {
        console.error('Load map data error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleLayer = useCallback((key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filteredRequests = selectedCity
    ? requests.filter((r) => {
        const city = GUANGXI_CITIES.find((c) => c.name === selectedCity);
        if (!city) return false;
        return Math.abs(r.lat - city.lat) < 0.5 && Math.abs(r.lng - city.lng) < 0.5;
      })
    : requests;

  // 关闭弹窗
  const handleMapClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-detail-panel')) return;
    setSelectedItem(null);
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* 顶部：城市筛选 + 图层切换 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setSelectedCity(null); setSelectedItem(null); }}
            className={`px-2 py-1 text-[11px] rounded transition-colors ${!selectedCity ? 'bg-terminal-accent text-black font-medium' : 'bg-terminal-border text-terminal-muted hover:text-terminal-text'}`}
          >
            全部
          </button>
          {GUANGXI_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => { setSelectedCity(city.name); setSelectedItem(null); }}
              className={`px-2 py-1 text-[11px] rounded transition-colors ${selectedCity === city.name ? 'bg-terminal-accent text-black font-medium' : 'bg-terminal-border text-terminal-muted hover:text-terminal-text'}`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* 图层切换 */}
        <div className="flex items-center gap-3 text-[10px] text-terminal-muted">
          <label className="flex items-center gap-1 cursor-pointer hover:text-terminal-text">
            <input type="checkbox" checked={layers.requests} onChange={() => toggleLayer('requests')} className="accent-red-500" />
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 求助</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-terminal-text">
            <input type="checkbox" checked={layers.shelters} onChange={() => toggleLayer('shelters')} className="accent-green-500" />
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500" /> 安置点</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-terminal-text">
            <input type="checkbox" checked={layers.volunteers} onChange={() => toggleLayer('volunteers')} className="accent-blue-500" />
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 志愿者</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Map */}
        <div className="col-span-2 bg-terminal-card border border-terminal-border rounded-lg p-4 relative" onClick={handleMapClick}>
          <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: '500px' }}>
            {/* Background grid */}
            {Array.from({ length: 8 }, (_, i) => (
              <React.Fragment key={`grid-${i}`}>
                <line x1={i * 14.3} y1={0} x2={i * 14.3} y2={100} stroke="#1E1E24" strokeWidth={0.1} />
                <line x1={0} y1={i * 14.3} x2={100} y2={i * 14.3} stroke="#1E1E24" strokeWidth={0.1} />
              </React.Fragment>
            ))}

            {/* City labels */}
            {GUANGXI_CITIES.map((city) => (
              <text
                key={city.name}
                x={toSvgX(city.lng)} y={toSvgY(city.lat)}
                textAnchor="middle" fill="#52525B" fontSize="2"
              >
                {city.name}
              </text>
            ))}

            {/* Help Requests */}
            {layers.requests && filteredRequests.map((r) => {
              const color = r.urgency === 'critical' ? '#FF4444' : r.urgency === 'high' ? '#FF8800' : r.urgency === 'medium' ? '#FFD600' : '#2979FF';
              const isSelected = selectedItem?.type === 'request' && (selectedItem.data as HelpRequest).id === r.id;
              return (
                <circle
                  key={r.id}
                  cx={toSvgX(r.lng)} cy={toSvgY(r.lat)}
                  r={r.urgency === 'critical' ? 2.5 : 1.5}
                  fill={color} opacity={isSelected ? 1 : 0.8}
                  stroke={isSelected ? '#FFF' : 'none'} strokeWidth={isSelected ? 0.4 : 0}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'request', data: r }); }}
                />
              );
            })}

            {/* Shelters */}
            {layers.shelters && shelters.map((s) => {
              const isSelected = selectedItem?.type === 'shelter' && (selectedItem.data as Shelter).id === s.id;
              return (
                <rect
                  key={s.id}
                  x={toSvgX(s.lng) - 1.5} y={toSvgY(s.lat) - 1.5}
                  width={3} height={3}
                  fill="#00C853" opacity={isSelected ? 1 : 0.7}
                  stroke={isSelected ? '#FFF' : 'none'} strokeWidth={isSelected ? 0.3 : 0}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'shelter', data: s }); }}
                />
              );
            })}

            {/* Volunteers */}
            {layers.volunteers && volunteers.map((v) => {
              const isSelected = selectedItem?.type === 'volunteer' && (selectedItem.data as { id: string }).id === v.id;
              return (
                <circle
                  key={v.id}
                  cx={toSvgX(v.lng)} cy={toSvgY(v.lat)}
                  r={isSelected ? 1.5 : 1}
                  fill="#2979FF" opacity={isSelected ? 1 : 0.6}
                  stroke={isSelected ? '#FFF' : 'none'} strokeWidth={isSelected ? 0.3 : 0}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'volunteer', data: v }); }}
                />
              );
            })}
          </svg>

          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-terminal-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 求助点</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500" /> 安置点</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 志愿者</span>
          </div>

          {/* 详情弹窗 */}
          {selectedItem && (
            <div className="map-detail-panel absolute top-4 right-4 w-[260px] bg-terminal-bg border border-terminal-border rounded-lg p-3 shadow-2xl z-10 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-terminal-text text-xs font-semibold">
                  {selectedItem.type === 'request' ? '📋 求助详情' : selectedItem.type === 'shelter' ? '🏠 安置点详情' : '👤 志愿者信息'}
                </span>
                <button onClick={() => setSelectedItem(null)} className="text-terminal-muted hover:text-terminal-text text-sm leading-none">✕</button>
              </div>

              {selectedItem.type === 'request' && (() => {
                const r = selectedItem.data as HelpRequest;
                const urgencyLabel = { critical: 'I级特大', high: 'II级重大', medium: 'III级较大', low: 'IV级一般' }[r.urgency];
                const urgencyColor = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-blue-400' }[r.urgency];
                const statusLabel = { pending: '待处理', processing: '处理中', resolved: '已解决', cancelled: '已取消' }[r.status];
                return (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="text-terminal-text font-medium">{r.title || '未命名求助'}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${urgencyColor}`}>{urgencyLabel}</span>
                      <span className="text-terminal-muted text-[10px]">{statusLabel}</span>
                    </div>
                    <div className="text-terminal-muted">{r.address || '未知地址'}</div>
                    {r.description && <div className="text-terminal-muted text-[10px] leading-relaxed">{r.description}</div>}
                    <div className="flex justify-between text-[10px] text-terminal-muted">
                      <span>坐标: {r.lat.toFixed(2)}, {r.lng.toFixed(2)}</span>
                      {r.people_count && <span>人数: {r.people_count}</span>}
                    </div>
                    <div className="text-terminal-muted text-[9px]">{new Date(r.created_at).toLocaleString('zh-CN')}</div>
                  </div>
                );
              })()}

              {selectedItem.type === 'shelter' && (() => {
                const s = selectedItem.data as Shelter;
                const statusLabel = { open: '开放中', full: '已满', preparing: '准备中', closed: '已关闭' }[s.status];
                const statusColor = s.status === 'open' ? 'text-green-400' : s.status === 'full' ? 'text-red-400' : 'text-yellow-400';
                const occupancyPct = s.capacity > 0 ? ((s.current_occupancy / s.capacity) * 100).toFixed(0) : '0';
                return (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="text-terminal-text font-medium">{s.name}</div>
                    <span className={`text-[10px] font-bold ${statusColor}`}>{statusLabel}</span>
                    <div className="text-terminal-muted">{s.address}</div>
                    <div className="flex justify-between text-[10px] text-terminal-muted">
                      <span>容量: {s.capacity}人</span>
                      <span>入住: {s.current_occupancy}人 ({occupancyPct}%)</span>
                    </div>
                    {s.contact_phone && <div className="text-terminal-muted text-[10px]">电话: {s.contact_phone}</div>}
                  </div>
                );
              })()}

              {selectedItem.type === 'volunteer' && (() => {
                const v = selectedItem.data as { id: string; name: string; lat: number; lng: number; tier: string };
                const tierLabel = { tier1: '一级志愿者', tier2: '二级志愿者', tier3: '三级志愿者' }[v.tier] || v.tier;
                return (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="text-terminal-text font-medium">{v.name}</div>
                    <span className="text-blue-400 text-[10px] font-medium">{tierLabel}</span>
                    <div className="text-terminal-muted text-[10px]">坐标: {v.lat.toFixed(2)}, {v.lng.toFixed(2)}</div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Sidebar: Stats */}
        <div className="space-y-3">
          <StatPanel title="求助分布" items={[
            { label: 'I 级特大', value: requests.filter((r) => r.urgency === 'critical').length, color: 'text-red-400' },
            { label: 'II 级重大', value: requests.filter((r) => r.urgency === 'high').length, color: 'text-orange-400' },
            { label: 'III 级较大', value: requests.filter((r) => r.urgency === 'medium').length, color: 'text-yellow-400' },
            { label: 'IV 级一般', value: requests.filter((r) => r.urgency === 'low').length, color: 'text-blue-400' },
          ]} />
          <StatPanel title="资源概况" items={[
            { label: '安置点', value: shelters.length, color: 'text-green-400' },
            { label: '在线志愿者', value: volunteers.length, color: 'text-blue-400' },
            { label: '活跃求助', value: requests.filter((r) => r.status === 'pending' || r.status === 'processing').length, color: 'text-terminal-accent' },
          ]} />
        </div>
      </div>
    </div>
  );
}

function StatPanel({ title, items }: { title: string; items: { label: string; value: number; color: string }[] }) {
  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
      <h3 className="text-terminal-text text-xs font-semibold mb-2 uppercase tracking-wider">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-terminal-muted text-xs">{item.label}</span>
            <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

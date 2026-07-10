'use client';

// ============================================================
// View 4: 灾情地图 — 广西地图 + 分布标记
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';
import { AlertLevelBadge } from '@/components/shared/StatusBadge';
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

export function DisasterMapView() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [volunteers, setVolunteers] = useState<{ id: string; name: string; lat: number; lng: number; tier: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

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

  // SVG 坐标系（广西经纬度范围）
  const lonRange = [104.5, 112.0];
  const latRange = [20.9, 26.4];

  function toSvgX(lng: number) {
    return ((lng - lonRange[0]) / (lonRange[1] - lonRange[0])) * 100;
  }
  function toSvgY(lat: number) {
    return 100 - ((lat - latRange[0]) / (latRange[1] - latRange[0])) * 100;
  }

  const filteredRequests = selectedCity
    ? requests.filter((r) => {
        const city = GUANGXI_CITIES.find((c) => c.name === selectedCity);
        if (!city) return false;
        return Math.abs(r.lat - city.lat) < 0.5 && Math.abs(r.lng - city.lng) < 0.5;
      })
    : requests;

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      {/* City Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedCity(null)}
          className={`px-2 py-1 text-xs rounded ${!selectedCity ? 'bg-terminal-accent text-black' : 'bg-terminal-border text-terminal-muted'}`}
        >
          全部
        </button>
        {GUANGXI_CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => setSelectedCity(city.name)}
            className={`px-2 py-1 text-xs rounded transition-colors ${selectedCity === city.name ? 'bg-terminal-accent text-black' : 'bg-terminal-border text-terminal-muted hover:text-terminal-text'}`}
          >
            {city.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Map */}
        <div className="col-span-2 bg-terminal-card border border-terminal-border rounded-lg p-4">
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
                x={toSvgX(city.lng)}
                y={toSvgY(city.lat)}
                textAnchor="middle"
                className="fill-terminal-muted"
                style={{ fontSize: '2px' }}
              >
                {city.name}
              </text>
            ))}

            {/* Help Requests */}
            {filteredRequests.map((r) => {
              const color = r.urgency === 'critical' ? '#FF4444' : r.urgency === 'high' ? '#FF8800' : r.urgency === 'medium' ? '#FFD600' : '#2979FF';
              return (
                <circle
                  key={r.id}
                  cx={toSvgX(r.lng)}
                  cy={toSvgY(r.lat)}
                  r={r.urgency === 'critical' ? 2.5 : 1.5}
                  fill={color}
                  opacity={0.8}
                  className="cursor-pointer hover:opacity-100"
                />
              );
            })}

            {/* Shelters */}
            {shelters.map((s) => (
              <rect
                key={s.id}
                x={toSvgX(s.lng) - 1.5}
                y={toSvgY(s.lat) - 1.5}
                width={3}
                height={3}
                fill="#00C853"
                opacity={0.7}
                className="cursor-pointer"
              />
            ))}

            {/* Volunteers */}
            {volunteers.map((v) => (
              <circle
                key={v.id}
                cx={toSvgX(v.lng)}
                cy={toSvgY(v.lat)}
                r={1}
                fill="#2979FF"
                opacity={0.6}
              />
            ))}
          </svg>

          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-terminal-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 求助点</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> 安置点</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 志愿者</span>
          </div>
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

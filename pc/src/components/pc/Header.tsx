'use client';

// ============================================================
// PC Header — 顶部栏 + 应急预警横幅
// ============================================================

import React from 'react';

interface AlertBanner {
  level: 'red' | 'orange' | 'yellow' | 'blue';
  text: string;
  pendingRequests: number;
  activeAlerts: number;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string | number; color?: string }[];
  alertBanner?: AlertBanner;
}

const ALERT_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  red:    { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500' },
  blue:   { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500' },
};

const ALERT_LABELS: Record<string, string> = {
  red: 'I级响应', orange: 'II级响应', yellow: 'III级响应', blue: 'IV级响应',
};

export function Header({ title, subtitle, stats, alertBanner }: HeaderProps) {
  const alertStyle = alertBanner ? ALERT_COLORS[alertBanner.level] : null;

  return (
    <header className="shrink-0">
      {/* 主标题栏 */}
      <div className="h-14 px-6 bg-terminal-card border-b border-terminal-border flex items-center justify-between">
        <div>
          <h1 className="text-terminal-text text-base font-semibold">{title}</h1>
          {subtitle && <p className="text-terminal-muted text-xs">{subtitle}</p>}
        </div>
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-right">
                <div className={`text-lg font-bold ${stat.color || 'text-terminal-text'}`}>
                  {stat.value}
                </div>
                <div className="text-terminal-muted text-[10px] uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 应急预警横幅 */}
      {alertBanner && alertStyle && (
        <div
          className={`mx-0 px-6 py-2.5 ${alertStyle.bg} border-b ${alertStyle.border} flex items-center gap-3`}
          style={{ animation: 'pulseBorder 2s ease-in-out infinite' }}
        >
          {/* 脉冲指示灯 */}
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${alertStyle.badge} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${alertStyle.badge}`} />
          </span>

          {/* 响应等级 */}
          <span className={`text-xs font-bold ${alertStyle.text} px-2 py-0.5 rounded border ${alertStyle.border}`}>
            {ALERT_LABELS[alertBanner.level]}
          </span>

          {/* 预警文字 */}
          <span className={`text-xs font-medium flex-1 ${alertStyle.text}`}>
            {alertBanner.text}
          </span>

          {/* 快捷统计 */}
          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-terminal-muted">
              待处理求助 <span className="text-terminal-text font-bold">{alertBanner.pendingRequests}</span>
            </span>
            <span className="text-terminal-muted">
              活跃告警 <span className="text-red-400 font-bold">{alertBanner.activeAlerts}</span>
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

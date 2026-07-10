'use client';

// ============================================================
// PC Header — 顶部栏
// ============================================================

import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string | number; color?: string }[];
}

export function Header({ title, subtitle, stats }: HeaderProps) {
  return (
    <header className="h-14 px-6 bg-terminal-card border-b border-terminal-border flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-terminal-text text-base font-semibold">{title}</h1>
        {subtitle && <p className="text-terminal-muted text-xs">{subtitle}</p>}
      </div>
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-right">
              <div
                className={`text-lg font-bold ${stat.color || 'text-terminal-text'}`}
              >
                {stat.value}
              </div>
              <div className="text-terminal-muted text-[10px] uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

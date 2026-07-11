'use client';

// ============================================================
// View 6: 救援队伍 — 卡片展示 + 状态筛选
// ============================================================

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/api';
import type { RescueTeam } from '@/types/models';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

export function RescueTeamsView() {
  const [teams, setTeams] = useState<RescueTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const t = await dashboardApi.getRescueTeams();
        setTeams(t);
      } catch (err) {
        console.error('Load teams error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: '就绪', color: 'text-green-400', bg: 'bg-green-400/10' },
    deployed: { label: '已出动', color: 'text-terminal-accent', bg: 'bg-terminal-accent/10' },
    standby: { label: '待命', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-6 overflow-y-auto flex-1">
      <h3 className="text-terminal-text text-xs font-semibold uppercase tracking-wider mb-4">救援队伍 ({teams.length})</h3>

      {teams.length === 0 ? (
        <EmptyState icon="✦" title="暂无救援队伍" />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {teams.map((team) => {
            const sc = statusConfig[team.status] || statusConfig.active;
            return (
              <div key={team.id} className="bg-terminal-card border border-terminal-border rounded-lg p-4 hover:border-terminal-accent/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-terminal-text font-semibold text-sm">{team.name}</div>
                    <div className="text-terminal-muted text-[10px] uppercase mt-0.5">{team.team_type}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${sc.color} ${sc.bg}`}>
                    {sc.label}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-terminal-muted">人数</span>
                    <span className="text-terminal-text font-mono">{team.member_count}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-terminal-muted">负责人</span>
                    <span className="text-terminal-text">{team.leader_name || '-'}</span>
                  </div>
                  {team.leader_phone && (
                    <div className="flex justify-between text-xs">
                      <span className="text-terminal-muted">电话</span>
                      <span className="text-terminal-text font-mono">{team.leader_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

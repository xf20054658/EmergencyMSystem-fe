'use client';

// ============================================================
// Mobile 我要帮忙 — 志愿者任务列表
// ============================================================

import React, { useEffect, useState } from 'react';
import { volunteerApi, matchApi } from '@/api';
import type { Match } from '@/types/models';
import { UrgencyBadge, MatchStatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner, EmptyState } from '@/components/shared/LoadingSpinner';

const MOCK_NEARBY = true; // 无后端时使用模拟数据

export function MobileHelpView() {
  const [tasks, setTasks] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Try loading nearby tasks, fallback to match list
        const res = await matchApi.list({ match_status: 'pending', page_size: 20 });
        setTasks(res.items);
      } catch {
        // Mock data
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAccept = async (matchId: string) => {
    try {
      await matchApi.accept(matchId);
      setTasks((prev) => prev.map((t) => (t.id === matchId ? { ...t, match_status: 'accepted' as const } : t)));
      alert('已接受任务！请尽快前往');
    } catch {
      alert('操作失败，请重试');
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="p-4 pb-24 space-y-4">
      <h1 className="text-ios-text text-xl font-bold pt-2">我要帮忙</h1>

      {/* Stats */}
      <div className="ios-card flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-ios-blue text-lg font-bold">{tasks.length}</div>
          <div className="text-ios-muted text-xs">等待响应</div>
        </div>
        <div className="w-px h-8 bg-ios-separator" />
        <div className="text-center flex-1">
          <div className="text-ios-green text-lg font-bold">
            {tasks.filter((t) => t.match_status === 'accepted' || t.match_status === 'enroute').length}
          </div>
          <div className="text-ios-muted text-xs">进行中</div>
        </div>
        <div className="w-px h-8 bg-ios-separator" />
        <div className="text-center flex-1">
          <div className="text-ios-text text-lg font-bold">
            {tasks.filter((t) => t.match_status === 'completed').length}
          </div>
          <div className="text-ios-muted text-xs">已完成</div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <EmptyState icon="🤝" title="暂无待响应的求助" description="附近还没有需要帮助的请求" />
        ) : (
          tasks.map((m) => (
            <div key={m.id} className="ios-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MatchStatusBadge status={m.match_status} />
                    {m.help_request?.urgency && <UrgencyBadge level={m.help_request.urgency} />}
                  </div>
                  <div className="text-ios-text text-sm font-medium mt-1.5">
                    {m.help_request?.title || `匹配 #${m.id.slice(0, 8)}`}
                  </div>
                  <div className="text-ios-muted text-xs mt-0.5">
                    距离: {m.match_radius_used ? `${m.match_radius_used}km` : '未知'} ·
                    匹配分: {m.match_score ?? '-'}
                  </div>
                </div>
              </div>
              {m.match_status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAccept(m.id)}
                    className="flex-1 py-2.5 bg-ios-blue text-white rounded-xl text-sm font-semibold"
                  >
                    接受任务
                  </button>
                  <button
                    onClick={() => matchApi.reject(m.id, '无法接单')}
                    className="flex-1 py-2.5 bg-gray-100 text-ios-text rounded-xl text-sm"
                  >
                    跳过
                  </button>
                </div>
              )}
              {m.match_status === 'accepted' && (
                <button className="w-full mt-3 py-2.5 bg-ios-green text-white rounded-xl text-sm font-semibold">
                  前往中...
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

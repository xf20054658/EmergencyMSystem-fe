'use client';

// ============================================================
// StatusBadge — 状态标签组件
// ============================================================

import React from 'react';

interface StatusBadgeProps {
  status: string;
  labelMap: Record<string, string>;
  colorMap: Record<string, string>;
  className?: string;
}

export function StatusBadge({ status, labelMap, colorMap, className = '' }: StatusBadgeProps) {
  const label = labelMap[status] || status;
  const colorClass = colorMap[status] || 'bg-gray-500 text-white';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
}

// 预设状态组件
import {
  MATCH_STATUS_LABELS, MATCH_STATUS_COLORS,
  URGENCY_LABELS, URGENCY_COLORS,
  REQUEST_STATUS_LABELS,
  TIER_LABELS, TIER_COLORS,
  ALERT_LEVEL_LABELS, ALERT_LEVEL_COLORS,
  BATCH_STATUS_LABELS,
  SHELTER_STATUS_LABELS,
  ROUTE_LABELS,
} from '@/lib/constants';

export function MatchStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} labelMap={MATCH_STATUS_LABELS} colorMap={MATCH_STATUS_COLORS} className={className} />;
}

export function UrgencyBadge({ level, className }: { level: string; className?: string }) {
  return <StatusBadge status={level} labelMap={URGENCY_LABELS} colorMap={URGENCY_COLORS} className={className} />;
}

export function RequestStatusBadge({ status, className }: { status: string; className?: string }) {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-500 text-black',
    processing: 'bg-blue-500 text-white',
    resolved: 'bg-green-500 text-white',
    cancelled: 'bg-gray-400 text-white',
  };
  return <StatusBadge status={status} labelMap={REQUEST_STATUS_LABELS} colorMap={colorMap} className={className} />;
}

export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  return <StatusBadge status={tier} labelMap={TIER_LABELS} colorMap={TIER_COLORS} className={className} />;
}

export function AlertLevelBadge({ level, className }: { level: string; className?: string }) {
  return <StatusBadge status={level} labelMap={ALERT_LEVEL_LABELS} colorMap={ALERT_LEVEL_COLORS} className={className} />;
}

export function BatchStatusBadge({ status, className }: { status: string; className?: string }) {
  const colorMap: Record<string, string> = {
    preparing: 'bg-gray-500 text-white',
    in_transit: 'bg-blue-500 text-white',
    arrived: 'bg-cyan-500 text-white',
    distributing: 'bg-yellow-500 text-black',
    distributed: 'bg-green-500 text-white',
    recalled: 'bg-red-500 text-white',
    expired: 'bg-gray-400 text-white',
  };
  return <StatusBadge status={status} labelMap={BATCH_STATUS_LABELS} colorMap={colorMap} className={className} />;
}

export function ShelterStatusBadge({ status, className }: { status: string; className?: string }) {
  const colorMap: Record<string, string> = {
    open: 'bg-green-500 text-white',
    full: 'bg-red-500 text-white',
    preparing: 'bg-yellow-500 text-black',
    closed: 'bg-gray-400 text-white',
  };
  return <StatusBadge status={status} labelMap={SHELTER_STATUS_LABELS} colorMap={colorMap} className={className} />;
}

export function RouteBadge({ route, className }: { route: string; className?: string }) {
  const labelMap = ROUTE_LABELS;
  const colorMap: Record<string, string> = {
    centralized: 'bg-purple-500 text-white',
    p2p: 'bg-cyan-500 text-white',
  };
  return <StatusBadge status={route} labelMap={labelMap} colorMap={colorMap} className={className} />;
}

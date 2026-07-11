// ============================================================
// 枚举标签映射 — 前端展示用
// ============================================================

export const URGENCY_LABELS: Record<string, string> = {
  critical: 'I级 特大',
  high: 'II级 重大',
  medium: 'III级 较大',
  low: 'IV级 一般',
};

export const URGENCY_COLORS: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white',
};

export const MATCH_STATUS_LABELS: Record<string, string> = {
  pending: '待响应',
  accepted: '已接受',
  enroute: '前往中',
  waiting: '受阻等待',
  unreachable: '失联',
  completed: '已完成',
  rejected: '已拒绝',
  timeout: '已超时',
  escalated: '已升级',
};

export const MATCH_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500 text-white',
  accepted: 'bg-blue-500 text-white',
  enroute: 'bg-green-500 text-white',
  waiting: 'bg-yellow-500 text-black',
  unreachable: 'bg-red-500 text-white',
  completed: 'bg-emerald-600 text-white',
  rejected: 'bg-gray-400 text-white',
  timeout: 'bg-orange-500 text-white',
  escalated: 'bg-purple-500 text-white',
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  cancelled: '已取消',
};

export const TIER_LABELS: Record<string, string> = {
  tier1: '认证救援队',
  tier2: '认证志愿者',
  tier3: '普通市民',
};

export const TIER_COLORS: Record<string, string> = {
  tier1: 'bg-amber-500 text-black',
  tier2: 'bg-blue-500 text-white',
  tier3: 'bg-gray-400 text-white',
};

export const ALERT_LEVEL_LABELS: Record<string, string> = {
  red: '红色预警',
  orange: '橙色预警',
  yellow: '黄色预警',
  blue: '蓝色预警',
};

export const ALERT_LEVEL_COLORS: Record<string, string> = {
  red: 'bg-red-600 text-white',
  orange: 'bg-orange-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  blue: 'bg-blue-500 text-white',
};

export const BATCH_STATUS_LABELS: Record<string, string> = {
  preparing: '备货中',
  in_transit: '运输中',
  arrived: '已到达',
  distributing: '分发中',
  distributed: '已分发',
  recalled: '已召回',
  expired: '已过期',
};

export const SHELTER_STATUS_LABELS: Record<string, string> = {
  open: '开放中',
  full: '已满',
  preparing: '筹备中',
  closed: '已关闭',
};

export const ROUTE_LABELS: Record<string, string> = {
  centralized: '集中派单',
  p2p: 'P2P互助',
};

export const VUL_GROUP_LABELS: Record<string, string> = {
  elderly: '老人',
  child: '儿童',
  pregnant: '孕妇',
  disabled: '残障人士',
  chronic: '慢性病患者',
};

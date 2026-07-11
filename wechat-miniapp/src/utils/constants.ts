// ============================================================
// 枚举标签映射
// ============================================================

export const URGENCY_LABELS: Record<string, string> = {
  critical: 'I级 特大',
  high: 'II级 重大',
  medium: 'III级 较大',
  low: 'IV级 一般',
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

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  cancelled: '已取消',
};

export const ALERT_LEVEL_LABELS: Record<string, string> = {
  red: '红色预警',
  orange: '橙色预警',
  yellow: '黄色预警',
  blue: '蓝色预警',
};

export const VUL_GROUP_LABELS: Record<string, string> = {
  elderly: '老人',
  child: '儿童',
  pregnant: '孕妇',
  disabled: '残障人士',
  chronic: '慢性病患者',
};

export const SHELTER_STATUS_LABELS: Record<string, string> = {
  open: '开放中',
  full: '已满',
  preparing: '筹备中',
  closed: '已关闭',
};

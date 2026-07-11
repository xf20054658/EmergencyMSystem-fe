// ============================================================
// Mock 模式开关 — 开发环境下自动启用 mock 数据
// 来源: docs/html/designer/database/mock-data.sql
// ============================================================

// 开发环境自动启用，生产构建自动关闭
export const MOCK_ENABLED = process.env.NODE_ENV === 'development' || process.env.TARO_ENV === 'weapp';

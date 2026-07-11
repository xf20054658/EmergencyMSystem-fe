# 前端开发指南 (前端 Agent 专属上下文)

## 1. 技术栈
- Framework: React / Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- HTTP Client: Axios
- Package Manager: npm

## 2. Agent 行为约束
- 所有的 API 请求必须封装在 `src/api/` 目录下。
- 严禁编写任何直接连接数据库的代码。

## 3. 项目结构

```
src/frontend/
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── src/
│   ├── app/                          # Next.js App Router 页面
│   │   ├── layout.tsx                # 根布局
│   │   ├── page.tsx                  # 入口（自动跳转 PC/M）
│   │   ├── providers.tsx             # AuthContext + Toast
│   │   ├── globals.css               # 全局样式 + Tailwind
│   │   ├── pc/
│   │   │   └── page.tsx              # PC 指挥中心 (9 Views SPA)
│   │   └── m/
│   │       └── page.tsx              # Mobile 群众端 (5 Tab)
│   ├── api/                          # API 请求层
│   │   ├── client.ts                 # Axios 封装 (JWT 拦截)
│   │   ├── auth.ts                   # 认证 API
│   │   ├── help-requests.ts          # 求助 API
│   │   ├── matches.ts                # 匹配 API
│   │   ├── volunteers.ts             # 志愿者 API
│   │   ├── notifications.ts          # 通知 API
│   │   ├── alerts.ts                 # 灾情预警 API
│   │   ├── reviews.ts                # 评价 API
│   │   ├── sos.ts                    # SOS API
│   │   ├── dashboard.ts              # 指挥中心 API
│   │   ├── calls.ts                  # 通话 API
│   │   └── index.ts                  # 统一导出
│   ├── types/                        # TypeScript 类型
│   │   ├── models.ts                 # 数据模型 (与 DB 对齐)
│   │   ├── api.ts                    # API 通用类型
│   │   └── index.ts
│   ├── contexts/
│   │   └── AuthContext.tsx            # 认证状态管理
│   ├── hooks/
│   │   └── useWebSocket.ts           # WebSocket 实时通信
│   ├── lib/
│   │   └── constants.ts              # 枚举标签/颜色映射
│   └── components/
│       ├── shared/
│       │   ├── StatusBadge.tsx        # 状态标签组件
│       │   └── LoadingSpinner.tsx     # 加载/空状态
│       ├── pc/
│       │   ├── PCLayout.tsx           # PC 布局 (Sidebar+Header)
│       │   ├── PCLoginView.tsx        # PC 登录
│       │   ├── Sidebar.tsx            # 左侧导航
│       │   ├── Header.tsx             # 顶部栏
│       │   ├── DashboardView.tsx      # View 1: 指挥总览
│       │   ├── HelpRequestsView.tsx   # View 2: 求助管理
│       │   ├── MatchMonitorView.tsx   # View 3: 匹配监控
│       │   ├── DisasterMapView.tsx    # View 4: 灾情地图
│       │   ├── ResourcesView.tsx      # View 5: 物资调度
│       │   ├── RescueTeamsView.tsx    # View 6: 救援队伍
│       │   ├── VolunteersView.tsx     # View 7: 志愿者管理
│       │   ├── SheltersView.tsx       # View 8: 安置点
│       │   └── AnalyticsView.tsx      # View 9: 数据分析
│       └── mobile/
│           ├── MobileLayout.tsx       # Mobile 布局 (TabBar)
│           ├── TabBar.tsx             # 底部 5 Tab 导航
│           ├── SOSButton.tsx          # SOS 防误触按钮
│           ├── MobileHomeView.tsx     # 首页 (SOS + 快捷)
│           ├── MobileMapView.tsx      # 灾情地图
│           ├── MobileReportView.tsx   # 求助上报 (含代报)
│           ├── MobileHelpView.tsx     # 我要帮忙
│           ├── MobileMyReportsView.tsx# 我的上报
│           ├── MobileSheltersView.tsx # 避难所
│           ├── MobileNotificationsView.tsx # 通知中心
│           └── MobileProfileView.tsx  # 个人中心/登录
```

## 4. 设计系统

### PC 端 (Dark Bloomberg Terminal)
- 背景: `#0A0A0C` → `bg-terminal-bg`
- 卡片: `#131316` → `bg-terminal-card`
- 边框: `#1E1E24` → `border-terminal-border`
- 文字: `#E4E4E7` → `text-terminal-text`
- 弱文字: `#71717A` → `text-terminal-muted`
- 主题色: `#FF8800` → `text-terminal-accent`

### Mobile 端 (iOS 浅色风格)
- 背景: `#F2F2F7` → `bg-ios-bg`
- 卡片: `#FFFFFF` → `bg-ios-card`
- 文字: `#1C1C1E` → `text-ios-text`
- 弱文字: `#8E8E93` → `text-ios-muted`
- 警示红: `#FF3B30` → `text-ios-red`

## 5. API 调用规范

```typescript
// 导入对应模块
import { helpRequestApi } from '@/api';

// 调用（自动处理 JWT、错误、401 跳转登录）
const res = await helpRequestApi.list({ urgency: 'critical', page_size: 20 });
// res.items: HelpRequest[]
// res.total: number
```

## 6. 开发命令

```bash
npm run dev     # 启动开发服务器
npm run build   # 生产构建
```

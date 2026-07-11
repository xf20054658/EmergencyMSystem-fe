# 🆘 EmergencyMSystem 应急协同平台 — 微信小程序端

> **广西洪涝灾害应急管理多端协同平台**  
> Taro 3 · React · TypeScript · SCSS  
> 原生微信小程序群众端

> 💻 PC / Mobile Web 端请查看 [`pc/`](../pc)

---

## 🤝 献给灾区

**本项目无条件捐献给受灾地区及各级应急管理部门使用。**

- ✅ 完全开源，**无偿使用**
- ✅ 微信原生能力：一键授权登录、手机号获取、LBS 定位
- ✅ SOS 一键报警 + P2P 志愿者就近匹配
- ✅ 离线优先 + Mock 数据，可脱离后端独立调试

> **灾情不等人，技术无边界。**

---

## 📋 功能总览

| 功能 | 说明 |
|------|------|
| 🏠 首页 | 灾情概览 + 快捷入口 + 避难所推荐 |
| 🗺️ 灾情地图 | 附近求助点 / 避难所标记 |
| 🆘 紧急求助 | 表单上报：位置/描述/人数/物资需求 + 特殊群体标记 |
| 🤝 我要帮忙 | 志愿者浏览附近可接任务、实时接单 |
| 🔔 通知中心 | 服务通知列表 + 全部已读 |
| 📋 我的上报 | 历史求助记录、状态追踪 |
| 🏠 避难所 | 避难所列表、容量信息 |
| 👤 个人中心 | 微信一键登录 / 手机号登录 / 通知偏好 |
| ⚙️ 通知偏好 | 推送通知开关、提醒方式设置 |

---

## 🚀 快速开始

### 前置条件

- Node.js 18+
- npm
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 安装 & 启动

```bash
# 在 src/frontend/ 根目录（推荐）
npm install                   # npm workspaces 统一安装

# 编译为微信小程序
npm run dev:miniapp           # 或 npm run build:miniapp

# 打开微信开发者工具
# 导入项目目录：src/frontend/wechat-miniapp/dist/
```

> 如仅在此目录单独开发：
> ```bash
> cd wechat-miniapp && npm install && npm run build:weapp
> ```

### 开发模式

```bash
# 增量编译（修改自动更新）
npm run build:weapp -- --watch

# 生产构建
npm run build:weapp
```

### Mock 模式

项目内置 Mock 数据层，可在后端未启动时独立调试所有功能：

- 自动使用：无需额外配置，初始化即启用
- 手动切换：修改 `src/app.tsx` 中 `enableMock` 变量

---

## 🏗 项目结构

```
src/frontend/
├── package.json              # 根 workspace（统一脚本）
├── pc/                       # Next.js Web 端
└── wechat-miniapp/           # ← 当前目录：Taro 小程序端
    ├── src/
    │   ├── app.tsx                       # 应用入口（Mock 切换）
    │   ├── app.config.ts                 # 页面路由 + TabBar 配置
    │   ├── app.scss                      # 全局样式
    │   │
    │   ├── pages/                        # 页面
    │   │   ├── index/                    # 首页
    │   │   ├── map/                      # 灾情地图
    │   │   ├── report/                   # 紧急求助
    │   │   ├── help/                     # 我要帮忙
    │   │   ├── profile/                  # 个人中心（微信登录）
    │   │   ├── myreports/                # 我的上报
    │   │   ├── notifications/            # 通知中心
    │   │   ├── shelters/                 # 避难所
    │   │   └── preferences/              # 通知偏好
    │   │
    │   ├── services/                     # API 请求层
    │   │   ├── api.ts                    # 底层：JWT + 401 拦截
    │   │   └── index.ts                  # 各模块接口定义
    │   │
    │   ├── mock/                         # Mock 数据层
    │   │   └── service.ts                # 与 services 接口一一对应
    │   │
    │   ├── types/
    │   │   └── models.ts                 # 数据模型定义
    │   │
    │   ├── utils/                        # 工具函数
    │   │   ├── auth.ts                   # 登录状态管理
    │   │   ├── helpers.ts                # 通用工具（手机号脱敏等）
    │   │   └── constants.ts              # 枚举映射
    │   │
    │   ├── components/                   # 公共组件
    │   │   └── TabBar/                    # 底部导航（子页面复用）
    │   │
    │   ├── custom-tab-bar/              # 自定义 TabBar（原生页面）
    │   └── assets/                       # 图标资源
    │       └── tabbar/                   # TabBar 图标（10张）
    │
    ├── config/                           # Taro 构建配置
    ├── types/                            # 全局类型声明
    ├── scripts/                          # 构建脚本
    ├── package.json
    ├── tsconfig.json
    ├── babel.config.js
    └── project.config.json               # 微信开发者工具配置
```

---

## 🔌 微信登录流程

```
用户点击「微信一键登录」
  → 弹出微信授权（openType="getPhoneNumber"）
  → 用户授权后得到 { encryptedData, iv }
  → Taro.login() 获取 js_code
  → POST /api/v1/auth/login-wx
     { js_code, encryptedData, iv }
  → 后端：code2Session → 解密手机号 → 登录/注册
  → 返回 { token, user }（手机号已脱敏）
```

### 手机号脱敏

前端使用 `maskPhone()` 函数处理，`13812345678` → `138****5678`。

---

## 🎨 设计系统

小程序采用 **iOS 浅色风格**：

```
背景  → #F2F2F7      iOS 系统灰
卡片  → #FFFFFF      纯白卡片
主色  → #007AFF      iOS 蓝
绿色  → #07C160      微信绿（登录按钮）
文字  → #1C1C1E      深色文字
弱文  → #8E8E93      次要信息
红色  → #FF3B30      iOS 警示红
```

---

## 📦 依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| @tarojs/taro | ^3.6 | Taro 核心框架 |
| @tarojs/components | ^3.6 | Taro 跨端组件库 |
| @tarojs/taro-h5 | ^3.6 | H5 适配 |
| react | ^18 | UI 框架 |
| typescript | ^5 | 类型系统 |
| sass | ^1 | 样式预处理 |

---

## 📄 许可

本项目**无条件捐献给灾害应急领域**。任何组织和个人均可自由使用、修改和分发。

- 用于灾害应急救援的：✅ **无偿使用**
- 用于商业目的：✅ **免费，欢迎联系开发者**
- 用于学习研究：✅ **欢迎 Fork 和 PR**

**灾情不等人，技术无边界。** 🌊

---

> **项目维护者：** 见山架构师  
> **前端仓库：** https://github.com/xf20054658/EmergencyMSystem-fe  
> **后端仓库：** https://github.com/xf20054658/EmergencyMSystem-be  
> **如有应急部署需求，请直接提交 Issue，我们会在 24 小时内响应。**

# hitcf-web

HiTCF 用户前端 —— TCF Canada 在线练习平台。

## 技术栈

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** — UI 组件库
- **Zustand** — 状态管理
- **Lucide React** — 图标

## 项目结构

```
hitcf-web/src/
├── app/
│   ├── layout.tsx                        # 根布局（AuthProvider）
│   ├── page.tsx                          # / → 重定向到 /tests
│   ├── globals.css                       # Tailwind + CSS 变量
│   └── (main)/                           # 认证区域布局组
│       ├── layout.tsx                    #   Navbar + 内容区
│       ├── tests/
│       │   ├── page.tsx                  #   /tests — 题库列表
│       │   ├── test-list.tsx             #     听力/阅读 Tab + 卡片网格
│       │   ├── test-card.tsx             #     单个题套卡片
│       │   └── [id]/page.tsx             #   /tests/:id — 题套详情 + 开始练习
│       ├── practice/
│       │   └── [attemptId]/
│       │       ├── page.tsx              #   /practice/:id — 练习入口
│       │       └── practice-session.tsx  #     练习主界面
│       └── results/
│           └── [attemptId]/
│               ├── page.tsx              #   /results/:id — 成绩入口
│               └── results-view.tsx      #     成绩展示 + 逐题回顾
├── components/
│   ├── layout/
│   │   ├── navbar.tsx                    # 顶部导航栏
│   │   └── user-menu.tsx                 # 用户下拉菜单
│   ├── practice/
│   │   ├── question-display.tsx          # 题目展示（题干 + passage）
│   │   ├── audio-player.tsx              # 听力播放器
│   │   ├── option-list.tsx               # 选项列表（选中→对错反馈）
│   │   ├── question-navigator.tsx        # 题号网格导航
│   │   └── explanation-panel.tsx         # 解析面板
│   ├── results/
│   │   └── score-card.tsx                # 分数展示卡片
│   ├── shared/
│   │   ├── loading-spinner.tsx           # 加载动画
│   │   ├── empty-state.tsx               # 空状态展示
│   │   └── pagination.tsx                # 通用分页
│   ├── providers/
│   │   └── auth-provider.tsx             # 认证上下文
│   └── ui/                               # Shadcn/ui 组件（自动生成）
├── lib/
│   ├── utils.ts                          # cn() helper
│   └── api/
│       ├── types.ts                      # TypeScript 类型定义
│       ├── client.ts                     # fetch 封装（GET/POST/PUT）
│       ├── auth.ts                       # 用户认证 API
│       ├── test-sets.ts                  # 题库 API
│       ├── attempts.ts                   # 练习/答题 API
│       ├── questions.ts                  # 题目详情 API
│       └── media.ts                      # 音频 URL API
└── stores/
    ├── auth-store.ts                     # 用户认证状态
    └── practice-store.ts                 # 练习会话状态
```

## 环境配置

创建 `.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> API 请求通过 Next.js rewrites 代理到后端，无需处理 CORS。

## 安装与启动

```bash
cd hitcf-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端运行在 `http://localhost:3000`。

**前提**：后端需先启动在 `localhost:8000`。

## 核心用户流程

```
/tests                         题库列表（听力/阅读 Tab）
  → /tests/:id                 题套详情页
    → 点击"开始练习"
      → POST /api/attempts     创建 attempt
      → /practice/:attemptId   进入练习
        → 逐题答题（选项→提交→对错反馈→解析）
        → 听力题播放音频
        → 全部答完 → 点击"完成练习"
          → POST /api/attempts/:id/complete
          → /results/:attemptId  查看成绩 + 逐题回顾
```

## 架构决策

| 决策 | 说明 |
|------|------|
| API 代理 | `next.config.mjs` rewrites `/api/*` → `localhost:8000/api/*`，自动转发 cookie |
| 状态管理 | Zustand，轻量无 Provider，仅管理 UI 状态（当前题号、已选答案） |
| 中文 UI | 全站中文，暂不用 i18n 库 |
| 音频 SAS | 每题播放前获取 15 分钟有效 Azure SAS URL，超 12 分钟自动刷新 |
| 解析占位 | explanation 数据尚未生成，面板显示"解析即将推出" |

## 开发阶段

- [x] **Phase 1** — 基础框架 + 题库浏览 + 练习做题 + 成绩查看
- [ ] **Phase 2** — 考试模式 + 速练 + 错题本 + 仪表盘
- [ ] **Phase 3** — 落地页 + 定价页 + 账户 + 订阅

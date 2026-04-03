# AGENTS.md - AI 编码代理指南

## 项目概述

本项目是 **QMediaSync** 的前端应用，基于 Vue 3 + TypeScript + Vite 构建。
主要功能包括：115网盘STRM同步、媒体刮削整理、上传下载队列管理、备份恢复、系统设置等。
UI框架使用 Element Plus，状态管理使用 Pinia，HTTP 请求使用 Axios。

## 常用命令

### 开发与构建

| 命令                 | 说明                                                      |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | 启动开发服务器 (Vite)                                     |
| `npm run build`      | 类型检查 + 生产构建（输出到 `../qmediasync/web_statics`） |
| `npm run build-only` | 仅构建，跳过类型检查                                      |
| `npm run preview`    | 预览生产构建                                              |

### 代码质量

| 命令                 | 说明                                                     |
| -------------------- | -------------------------------------------------------- |
| `npm run lint`       | ESLint 检查并自动修复 (`./src/**/*.{js,jsx,ts,tsx,vue}`) |
| `npm run type-check` | TypeScript 类型检查 (`vue-tsc --build`)                  |
| `npm run format`     | Prettier 格式化 (`src/` 目录)                            |

### 测试

本项目当前 **没有配置测试框架**，无测试相关命令。

## 项目结构

```
src/
├── App.vue                 # 根组件（布局、侧边栏菜单、备份进度弹窗）
├── main.ts                 # 应用入口（Axios拦截器、Pinia、Element Plus注册）
├── const.ts                # 常量定义（SERVER_URL）
├── typing.ts               # 全局TypeScript类型/接口定义
├── assets/                 # 静态资源与全局CSS
├── components/             # 页面组件（以 App 前缀命名）
├── composables/            # Vue组合式函数（以 use 前缀命名）
├── router/index.ts         # 路由配置与导航守卫
├── stores/                 # Pinia状态管理
│   ├── auth.ts             # 认证状态（登录/登出/token管理）
│   └── backup.ts           # 备份进度轮询状态
├── utils/                  # 工具函数（按功能拆分为独立文件）
│   ├── deviceUtils.ts      # 设备检测（移动端/桌面端）
│   ├── fileIconUtils.ts    # 文件图标映射
│   ├── fileSizeUtils.ts    # 文件大小格式化
│   ├── timeUtils.ts        # 时间/存储格式化
│   ├── sourceTypeUtils.ts  # 来源类型工具
│   ├── notificationUtils.ts# 通知工具
│   └── mockAPI.ts          # 模拟API数据
└── views/                  # 视图组件（当前较少使用）
```

## 代码风格指南

### 格式化规则（Prettier）

- **不使用分号** (`semi: false`)
- **使用单引号** (`singleQuote: true`)
- **行宽限制 100 字符** (`printWidth: 100`)
- **缩进**: 2 空格 (`.editorconfig`)
- **文件末尾**: 必须有空行，必须去除尾部空白

### TypeScript

- 所有 Vue 组件使用 `<script setup lang="ts">`
- 类型定义集中在 `src/typing.ts`，通过 `export type` 导出
- 组件内的局部类型使用 `interface` 或 `type` 直接定义
- 优先使用 `interface` 定义对象结构，`type` 定义联合类型
- 使用 `import type { X }` 导入纯类型
- **不要**使用 `any`，使用 `unknown` 或具体类型替代
- 路由元信息类型通过 `declare module 'vue-router'` 扩展

### 导入顺序

遵循项目中现有风格，按以下顺序组织导入：

```typescript
// 1. Vue 核心API
import { ref, computed, onMounted } from 'vue'

// 2. 第三方库
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 3. 项目内部模块
import { useAuthStore } from '@/stores/auth'
import { SERVER_URL } from '@/const'
import type { Lib, LibForm } from '@/typing'

// 4. 工具函数
import { formatTimestamp } from '@/utils/timeUtils'
```

路径别名: 使用 `@/` 代替 `src/`（已在 `vite.config.ts` 和 `tsconfig.app.json` 中配置）。

### Vue 组件规范

- 组件文件命名：页面组件使用 `App` 前缀（如 `AppLogin.vue`），通用组件使用 PascalCase
- Props 使用 `defineProps<{ ... }>()` 泛型语法
- Emits 使用 `defineEmits<{ (e: 'eventName', payload: Type): void }>()` 语法
- 组合式函数使用 `use` 前缀，放在 `src/composables/` 目录
- 组件内 `<style scoped>` 优先；全局样式放在 `App.vue` 的非 scoped style 中
- 响应式状态：简单值用 `ref()`，复杂对象可考虑 `reactive()`

### Pinia Store 规范

- 使用组合式 API 风格：`defineStore('name', () => { ... })`
- 导出格式：`export const useXxxStore = defineStore('xxx', ...)`
- 状态用 `ref()`，计算属性用 `computed()`，方法定义为普通函数
- 最后 `return` 导出所有需要暴露的状态、计算属性和方法

### HTTP 请求规范

- Axios 实例通过 `inject('$http')` 在组件中获取（在 `main.ts` 中通过 `app.provide` 注册）
- API 基础地址统一使用 `SERVER_URL`（从 `@/const` 导入）
- 响应格式约定：`{ code: 200, data: ..., message: ... }`
- 全局 401 处理已在 `main.ts` 的 Axios 拦截器中实现
- 组件内调用示例：
  ```typescript
  const http = inject<AxiosStatic>('$http')
  const res = await http?.get(`${SERVER_URL}/some/endpoint`)
  if (res?.data.code === 200) {
    /* 处理成功 */
  }
  ```

### 错误处理

- API 错误使用 `try/catch`，通过 `ElMessage.error()` 显示用户提示
- 网络错误使用中文提示信息（如 `'登录失败，请检查网络连接'`）
- `catch` 块中使用 `console.error()` 记录日志
- 用户取消操作（如 `ElMessageBox.confirm` 取消）使用空 `catch` 块
- WebSocket 连接失败实现指数退避重连（最多5次）

### 命名约定

| 类别       | 风格                          | 示例                                   |
| ---------- | ----------------------------- | -------------------------------------- |
| 组件文件   | PascalCase / App前缀          | `AppLogin.vue`, `CronSelector.vue`     |
| 组合式函数 | camelCase, use前缀            | `useWebSocket`, `useHourlyStats`       |
| Store      | camelCase, use前缀, Store后缀 | `useAuthStore`, `useBackupStore`       |
| 工具函数   | camelCase                     | `formatTimestamp`, `isMobile`          |
| 工具文件   | camelCase, Utils后缀          | `timeUtils.ts`, `deviceUtils.ts`       |
| 常量       | UPPER_SNAKE_CASE              | `SERVER_URL`, `MAX_RECONNECT_ATTEMPTS` |
| 类型/接口  | PascalCase                    | `BackupProgress`, `LibForm`            |
| 路由名称   | kebab-case                    | `sync-records`, `settings-strm`        |
| CSS 类名   | kebab-case                    | `.login-container`, `.mobile-header`   |

### 注释语言

- 代码注释和 JSDoc 使用 **中文**
- 环境变量注释使用中文

### 环境变量

通过 `import.meta.env.VITE_XXX` 访问，类型声明在 `env.d.ts` 中定义。
主要变量: `VITE_SERVER_URL`（后端API地址）。

## ESLint 配置

- 使用 `eslint-plugin-vue` 的 `flat/essential` 规则集
- 集成 `@vue/eslint-config-typescript`
- 集成 `@vue/eslint-config-prettier/skip-formatting`（格式化由Prettier处理）
- 忽略目录: `dist/`, `dist-ssr/`, `coverage/`

## 注意事项

- 项目没有测试框架，修改代码后请运行 `npm run lint` 和 `npm run type-check` 验证
- 构建输出目录为 `../qmediasync/web_statics`（相对于项目根目录的上级）
- 路由使用 Hash 模式 (`createWebHashHistory`)
- Element Plus 图标已全局注册，可直接在模板中使用组件名
- 移动端适配断点：768px（主要）、480px（小屏）、1024px（平板）

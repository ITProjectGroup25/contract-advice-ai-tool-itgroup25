# 📚 Contract Advice AI Tool - 部署文档

## 🏗️ 系统架构概览

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel        │    │  GitHub Actions  │    │   Supabase      │
│   (Frontend)    │◄───┤   (CI/CD)        ├───►│   (Database)    │
│   Next.js App   │    │                  │    │   PostgreSQL    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Production Environment                       │
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈
- 前端: Next.js 14 + TypeScript + Tailwind CSS
- 后端: Next.js API Routes + Drizzle ORM（与前端同仓同进程）
- 数据库: PostgreSQL（本地 Docker / Supabase 托管）
- 身份验证: NextAuth.js（Google OAuth）
- AI 服务: Google Gemini API（可选，按需配置）
- 部署: Vercel（应用）+ Supabase（数据库）
- CI/CD: GitHub Actions（前端构建、数据库迁移）

---

## 🚀 快速部署指南

### 1. 前提条件

#### 必需软件
```bash
Node.js >= 18.17.0
npm >= 8.0.0
Git >= 2.30.0
Docker Desktop (本地开发)
```

#### 服务账户
- [Vercel](https://vercel.com) 账户
- [Supabase](https://supabase.com) 项目
- [Google Cloud Console](https://console.cloud.google.com) (用于Gemini API)
- [GitHub](https://github.com) 仓库

### 2. 环境变量配置

#### 🔐 生产环境变量清单

| 变量名 | 环境 | 描述 | 示例值 |
|--------|------|------|--------|
| `DATABASE_URL` | All | PostgreSQL连接字符串 | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | All | NextAuth密钥 | `your-secret-key-32-chars-min` |
| `NEXTAUTH_URL` | All | 应用URL | `https://yourdomain.vercel.app` |
| `GOOGLE_CLIENT_ID` | All | Google OAuth客户端ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | All | Google OAuth密钥 | `GOCSPX-xxxxx` |
| `GEMINI_API_KEY` | All | Google Gemini API密钥 | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `NEXT_PUBLIC_BASE_URL` | Frontend | 公开的基础URL | `https://yourdomain.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Supabase项目URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

提示：生成 `NEXTAUTH_SECRET` 可用命令（任意一条）：
```bash
openssl rand -base64 32
# 或（仅 Node 环境）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏠 本地开发环境搭建

### 步骤 1: 克隆仓库
```bash
git clone https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25.git
cd contract-advice-ai-tool-itgroup25
```

### 步骤 2: 安装依赖
```bash
npm install
```

### 步骤 3: 启动本地数据库
```bash
cd docker
# 确认/编辑 docker/.env（默认已提供示例凭据）
docker compose up -d
cd ..
```

### 步骤 4: 配置环境变量

#### 根目录 `.env`
```bash
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
NEXTAUTH_SECRET=your-local-secret-key-change-me
NEXTAUTH_URL=http://localhost:3000
```

#### Frontend `.env.local`
```bash
DATABASE_URL=postgres://contract_user:contract_password@localhost:5432/contract_db
NEXTAUTH_SECRET=your-local-secret-key-change-me
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

### 步骤 5: 运行数据库迁移
```bash
npm run db:push --workspace backend
```

### 步骤 6: 启动开发服务器
```bash
npm run dev
```

🎉 应用现在运行在 http://localhost:3000

---

## 🌐 生产环境部署

### 1. Supabase 数据库配置

#### 创建项目
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 设置项目名称和密码
4. 选择地区（推荐选择离用户最近的地区）

#### 配置数据库
```bash
# 获取连接信息
DATABASE_URL: 在 Settings > Database 中找到 Connection string
SUPABASE_URL: 项目设置中的 API URL
SUPABASE_ANON_KEY: 项目设置中的 anon public key
```

### 2. Vercel 前端部署（Monorepo 配置重点）

#### 自动部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量（见上表，至少包括 `NEXTAUTH_URL`、`NEXTAUTH_SECRET`、`NEXT_PUBLIC_SUPABASE_*`、`DATABASE_URL`）
3. 项目设置（两种等效方式，任选其一）：
   - 方式 A（推荐，简单稳妥）
     - Root Directory: 仓库根目录
     - Install Command: `npm install`
     - Build Command: `npm run build --workspace frontend`
     - Output: 无需填写（Next.js 默认处理）
   - 方式 B（Root 指向子目录）
     - Root Directory: `frontend`
     - Install Command: `cd .. && npm install`（确保安装所有 workspace 依赖）
     - Build Command: `npm run build`
     - Output: 留空或使用默认值（Next.js 默认处理）

说明：前端在构建时会通过 tsconfig 路径别名引入 `../backend/src` 代码（例如 NextAuth、Drizzle）。采用方式 A 可确保相关依赖在云端构建时已正确安装；若采用方式 B，请务必使用上面的安装命令以在仓库根目录完成完整安装。

#### 手动部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel --prod
```

### 3. GitHub Actions CI/CD

#### 必需的 GitHub Secrets
在仓库 Settings > Secrets and variables > Actions 中添加：

```bash
# Vercel 配置
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id  
VERCEL_PROJECT_ID=your-project-id

# Supabase 配置
SUPABASE_ACCESS_TOKEN=your-supabase-token
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_DB_PASSWORD=your-db-password
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### CI/CD 流程
```yaml
Push to main branch → 
  Frontend CI (lint, typecheck, build) → 
  Supabase CI (validate, migrate) → 
  Deploy to Vercel
```

---

## 🔧 配置服务

### Google OAuth 设置
1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目
3. 配置 OAuth 同意屏幕（外部/内部，填写必要信息）
4. 在“凭据”中新建“OAuth 2.0 客户端 ID”（应用类型：Web 应用）
5. 添加授权重定向 URI：
   ```
   http://localhost:3000/api/auth/callback/google (开发)
   https://yourdomain.vercel.app/api/auth/callback/google (生产)
   ```

### Google Gemini API 设置（可选）
1. 在 Google Cloud Console 中启用 Generative AI API
2. 创建 API 密钥
3. 设置 API 配额和限制

### EmailJS 配置（如果使用）
1. 注册 [EmailJS](https://www.emailjs.com) 账户
2. 创建邮件服务
3. 配置邮件模板
4. 获取 Public Key 和 Service ID

---

## 📊 监控和维护

### 性能监控
- **Vercel Analytics**: 自动启用的页面性能监控
- **Supabase Dashboard**: 数据库性能和使用情况
- **GitHub Actions**: 构建和部署状态

### 日志查看
```bash
# Vercel 日志
vercel logs [deployment-url]

# Supabase 日志  
# 在 Supabase Dashboard > Logs 中查看

# 本地开发日志
npm run dev # 控制台输出
docker compose logs -f postgres # 数据库日志
```

### 定期维护任务
- [ ] 每月检查依赖更新
- [ ] 每季度备份数据库
- [ ] 监控 API 配额使用情况
- [ ] 检查安全漏洞扫描结果

---

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 检查 TypeScript 错误
npm run typecheck --workspace frontend

# 检查代码风格
npm run lint --workspace frontend

# 清理缓存重新构建
rm -rf frontend/.next
npm run build --workspace frontend
```

#### 2. 数据库连接问题
```bash
# 检查连接字符串格式
DATABASE_URL=postgresql://username:password@host:port/database

# 测试本地数据库连接
docker compose exec postgres psql -U contract_user -d contract_db

# 检查 Supabase 连接
# 在 Supabase Dashboard > Settings > Database 中测试
```

#### 3. 环境变量问题
```bash
# 检查环境变量是否正确加载
console.log(process.env.DATABASE_URL) // 在代码中临时添加

# Vercel 环境变量检查
vercel env ls

# 本地环境变量检查
cat .env
cat frontend/.env.local
```

#### 4. 部署失败
```bash
# 检查 Vercel 部署日志
vercel logs

# 检查 GitHub Actions 日志
# 在 GitHub 仓库的 Actions 标签页查看

# 手动触发部署
git push origin main --force-with-lease
```

### 回滚策略
```bash
# Vercel 回滚到上一个版本
vercel rollback [deployment-url]

# Git 回滚
git revert HEAD
git push origin main

# 数据库迁移回滚（建议）
# Drizzle 默认不提供自动 down 回滚命令。
# 生产环境建议通过：
#  1) 使用 Supabase 备份/还原；或
#  2) 为每个向上迁移编写对应的回滚 SQL，并在需要时手动执行。
```

---

## 📋 部署检查清单

### 部署前检查
- [ ] 所有环境变量已配置
- [ ] 代码通过所有测试
- [ ] 数据库迁移脚本已准备
- [ ] 第三方服务配额充足
- [ ] 备份当前生产数据

### 部署后检查
- [ ] 应用能正常访问
- [ ] 用户认证功能正常
- [ ] 数据库连接正常
- [ ] 表单提交功能正常
- [ ] PDF下载功能正常
- [ ] 邮件发送功能正常
- [ ] 性能指标正常

### 紧急联系
- **技术负责人**: [添加联系方式]
- **运维负责人**: [添加联系方式]
- **项目经理**: [添加联系方式]

---

## 📚 相关文档

- [本地开发指南](./LOCAL_SETUP.md)
- [API 文档](./dev/开发文档.md)
- [Docker 配置说明](./docker/README.md)
- [GitHub Actions 工作流](./.github/workflows/)

---

## 🔄 版本记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2025-09-28 | 初始部署文档 |

---

*最后更新: 2025-09-28*
*维护者: IT Project Group 25*

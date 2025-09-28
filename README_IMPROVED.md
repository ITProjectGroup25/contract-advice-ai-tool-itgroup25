# 📋 Contract Advice AI Tool

[![Frontend CI](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/actions/workflows/frontend-ci.yml)
[![Supabase CI](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/actions/workflows/supabase-ci.yml/badge.svg)](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/actions/workflows/supabase-ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)

> 🤖 **智能合同咨询工具** - 为大学研究人员提供AI驱动的合同条款审查和咨询服务

## 🌟 项目概述

Contract Advice AI Tool 是一个专为大学研究人员设计的智能合同咨询平台。通过集成Google Gemini AI，为用户提供合同条款审查、谈判支持和合规建议等服务。

### 🎯 核心功能

- **📝 智能表单生成** - 动态表单构建器，支持多种输入类型
- **🤖 AI咨询服务** - 基于Google Gemini的智能合同分析
- **📊 管理后台** - 完整的表单管理和结果分析系统
- **🔐 安全认证** - 集成Google OAuth和NextAuth.js
- **📧 邮件集成** - 自动化邮件通知和结果发送
- **📄 文档支持** - PDF文档下载和在线预览

### 🏗️ 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Backend API     │    │   Database      │
│   Next.js 14    │◄──►│  Next.js Routes  │◄──►│   Supabase      │
│   TypeScript    │    │  Drizzle ORM     │    │   PostgreSQL    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel        │    │  Google Gemini   │    │  GitHub Actions │
│   (Hosting)     │    │  (AI Service)    │    │  (CI/CD)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 快速开始

### 前提条件

```bash
Node.js >= 18.17.0
npm >= 8.0.0
Docker Desktop
```

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25.git
cd contract-advice-ai-tool-itgroup25

# 2. 安装依赖
npm install

# 3. 启动数据库
cd docker && docker compose up -d && cd ..

# 4. 配置环境变量 (参考 .env.example)
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# 5. 运行数据库迁移
npm run db:push --workspace backend

# 6. 启动开发服务器
npm run dev
```

🎉 访问 http://localhost:3000 开始使用！

## 🛠️ 技术栈

### 前端技术
- **[Next.js 14](https://nextjs.org/)** - React全栈框架
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全
- **[Tailwind CSS](https://tailwindcss.com/)** - 原子化CSS
- **[Shadcn/ui](https://ui.shadcn.com/)** - 现代UI组件库
- **[React Hook Form](https://react-hook-form.com/)** - 表单管理
- **[Framer Motion](https://www.framer.com/motion/)** - 动画库

### 后端技术
- **[Drizzle ORM](https://orm.drizzle.team/)** - 类型安全的ORM
- **[NextAuth.js](https://next-auth.js.org/)** - 身份认证
- **[Supabase](https://supabase.com/)** - 后端即服务
- **[PostgreSQL](https://www.postgresql.org/)** - 关系型数据库

### AI & 服务
- **[Google Gemini API](https://ai.google.dev/)** - AI分析服务
- **[EmailJS](https://www.emailjs.com/)** - 邮件服务
- **[Vercel](https://vercel.com/)** - 部署平台

### 开发工具
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD
- **[Docker](https://www.docker.com/)** - 容器化
- **[ESLint](https://eslint.org/)** - 代码规范
- **[Prettier](https://prettier.io/)** - 代码格式化

## 📁 项目结构

```
contract-advice-ai-tool-itgroup25/
├── 📁 frontend/              # Next.js 前端应用
│   ├── 📁 src/app/          # App Router 页面
│   ├── 📁 src/components/   # React 组件
│   └── 📁 public/           # 静态资源
├── 📁 backend/              # 后端服务
│   ├── 📁 src/             # 源代码
│   ├── 📁 drizzle/         # 数据库迁移
│   └── 📁 supabase/        # Supabase 配置
├── 📁 shared/               # 共享类型和工具
├── 📁 docker/               # Docker 配置
├── 📁 .github/              # GitHub Actions
└── 📄 DEPLOYMENT.md         # 部署文档
```

## 🎮 主要功能演示

### 📝 智能表单系统
- **动态表单构建** - 拖拽式表单设计器
- **条件逻辑** - 基于用户输入的智能问题流程
- **多种输入类型** - 文本、选择、文件上传等

### 🤖 AI咨询服务
- **简单查询** - 快速获得AI建议
- **复杂推荐** - 详细的专业分析
- **文档支持** - 内置培训指南和参考资料

### 📊 管理功能
- **表单管理** - 创建、编辑、发布表单
- **结果分析** - 提交数据的可视化分析
- **用户管理** - 安全的身份验证和授权

## 🚀 部署

### 环境变量配置

查看 [部署文档](./DEPLOYMENT.md) 获取完整的生产环境配置指南。

关键环境变量：
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
GEMINI_API_KEY=your-api-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25)

## 📚 文档

- 📖 [本地开发指南](./LOCAL_SETUP.md)
- 🚀 [部署文档](./DEPLOYMENT.md)
- 🐳 [Docker 配置](./docker/README.md)
- 💻 [开发文档](./dev/开发文档.md)
- 🎯 [API 参考](./dev/example.md)

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

### 开发流程
```bash
# 1. Fork 仓库并克隆
git clone https://github.com/YOUR_USERNAME/contract-advice-ai-tool-itgroup25.git

# 2. 创建功能分支
git checkout -b IPGCRT-XX/feature-name

# 3. 提交更改
git commit -m "feat: add new feature"

# 4. 推送分支
git push origin IPGCRT-XX/feature-name

# 5. 创建 Pull Request
```

### 分支命名规范
- 功能开发: `IPGCRT-{ID}/US{N}-{feature}`
- 杂项工作: `IPGCRT-{ID}-{feature}`
- 修复Bug: `IPGCRT-{ID}-bugfix`

### 代码规范
```bash
npm run lint          # 检查代码规范
npm run typecheck     # 类型检查
npm run test          # 运行测试
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 类型检查
npm run typecheck

# 代码规范检查
npm run lint

# 构建测试
npm run build
```

## 📊 项目状态

- ✅ **开发阶段**: 活跃开发中
- 🔄 **版本**: v1.0.0
- 📅 **最后更新**: 2025-09-28
- 🏷️ **许可证**: MIT

### 功能完成度
- [x] 基础表单系统 (100%)
- [x] AI集成 (100%)
- [x] 用户认证 (100%)
- [x] 管理后台 (90%)
- [ ] 高级分析 (开发中)
- [ ] 移动端优化 (计划中)

## 👥 团队

**IT Project Group 25**
- 🎯 项目经理: [Name]
- 💻 前端开发: [Name]
- ⚙️ 后端开发: [Name]
- 🎨 UI/UX设计: [Name]

## 📞 支持与联系

- 🐛 **问题报告**: [GitHub Issues](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/issues)
- 💬 **功能建议**: [GitHub Discussions](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/discussions)
- 📧 **邮件联系**: [project@example.com]
- 📚 **文档**: [Wiki](https://github.com/ITProjectGroup25/contract-advice-ai-tool-itgroup25/wiki)

## 📄 许可证

本项目采用 [MIT License](./LICENSE) 开源许可证。

## 🙏 致谢

感谢以下开源项目和服务：
- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 后端服务
- [Google Gemini](https://ai.google.dev/) - AI 服务
- [Vercel](https://vercel.com/) - 部署平台
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个Star！**

[⬆ 回到顶部](#-contract-advice-ai-tool)

</div>

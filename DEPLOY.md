# 🚀 Performance Lawn Order - Vercel 部署指南

本指南将帮助你将 Performance Lawn Order 应用部署到 Vercel 免费托管平台。

## 📋 前置条件

在开始部署前，请确保满足以下条件：

- ✅ GitHub 账号（用于代码托管）
- ✅ Vercel 账号（免费创建，[vercel.com](https://vercel.com)）
- ✅ Supabase 项目已创建且数据库迁移已完成
- ✅ 本地代码已提交到 GitHub
- ✅ Node.js 18.x 或更高版本（本地开发用）
- ✅ npm 或 yarn 包管理器

---

## 📦 步骤 1: 本地准备和测试

### 1.1 验证本地构建

在部署前，确保本地构建成功：

```bash
# 安装依赖
npm install

# 执行本地构建
npm run build

# 验证构建输出
ls -la dist/
# 应该看到 index.html 和其他资源文件

# 预览构建后的应用
npm run preview
# 在浏览器中打开 http://localhost:4173
```

### 1.2 测试本地环境变量

创建 `.env.local` 文件（开发用，不提交到 Git）：

```bash
# 复制 .env.example
cp .env.example .env.local

# 编辑 .env.local，填入你的 Supabase 凭证
nano .env.local
# 或用你喜欢的编辑器打开
```

在 `.env.local` 中填入：

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 1.3 验证环境变量已正确加载

```bash
# 本地运行
npm run dev

# 打开 http://localhost:8080
# 检查浏览器控制台是否有错误
# 尝试登录功能
```

如果一切正常，继续下一步。

---

## 🔑 步骤 2: 获取 Supabase 凭证

### 2.1 找到你的 Supabase 项目 URL 和密钥

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登录你的 Supabase 账户
3. 选择你的项目（项目列表中）
4. 进入 **Settings** → **API**
5. 你会看到以下信息：

```
Project URL: https://[PROJECT_ID].supabase.co
Project API Keys:
  - anon/public key: eyJ...（这是 VITE_SUPABASE_PUBLISHABLE_KEY）
  - service_role key: eyJ...（不要在客户端使用）
```

### 2.2 复制必要的值

记录以下信息（稍后需要在 Vercel 中使用）：

- **VITE_SUPABASE_PROJECT_ID**: `hzealevyevxabkrfxyod` （或你的项目 ID）
- **VITE_SUPABASE_URL**: `https://hzealevyevxabkrfxyod.supabase.co` （或你的 URL）
- **VITE_SUPABASE_PUBLISHABLE_KEY**: `eyJ...` （复制 anon key）

⚠️ **重要**:
- 绝不要使用 `service_role` 密钥在客户端
- 绝不要在代码或 GitHub 中提交真实的密钥
- 只在 Vercel 的安全环境变量中存储密钥

---

## 🐙 步骤 3: 准备 GitHub 仓库

### 3.1 检查代码是否已提交

```bash
# 检查 Git 状态
git status

# 添加所有更改
git add .

# 提交更改（使用有意义的提交消息）
git commit -m "chore: prepare for Vercel deployment

- Add vercel.json configuration
- Add .env.example template
- Update vite.config.ts with build optimizations
- Fix hardcoded Supabase credentials"

# 推送到 GitHub
git push origin main
```

### 3.2 验证 GitHub 仓库

- 访问你的 GitHub 仓库
- 确认所有文件都已推送
- 检查 `.env` 文件是否在 `.gitignore` 中（应该看不到密钥）

---

## 🚀 步骤 4: 部署到 Vercel

### 4.1 创建 Vercel 项目

1. 访问 [https://vercel.com](https://vercel.com)
2. 用 GitHub 账号登录（或注册新账户）
3. 点击 **Add New...** → **Project**
4. 选择你的 GitHub 仓库

### 4.2 配置项目设置

在 Vercel 部署向导中，确保以下设置正确：

```
项目名称: performance-lawn-order
(或其他名称，Vercel 会自动生成)

Framework Preset: Vite
(应该自动检测)

Root Directory: ./
(不需要更改)

Build Command: npm run build
(默认正确)

Output Directory: dist
(默认正确)

Install Command: npm install
(默认正确)
```

### 4.3 配置环境变量

在部署之前，添加环境变量：

1. 在部署向导中，找到 **Environment Variables** 部分
2. 添加以下变量：

| 变量名 | 值 |
|-------|-----|
| `VITE_SUPABASE_PROJECT_ID` | 你的 Supabase 项目 ID |
| `VITE_SUPABASE_URL` | 你的 Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 你的 Supabase 匿名密钥 |

**步骤**:
- 点击 "Add Environment Variable"
- 输入变量名（例如 `VITE_SUPABASE_URL`）
- 输入对应的值
- 重复添加其他变量

### 4.4 部署

1. 检查所有配置都正确
2. 点击 **Deploy** 按钮
3. 等待部署完成（通常 2-3 分钟）

你会看到类似的输出：
```
✓ Deployed to https://your-project.vercel.app
```

---

## ✅ 步骤 5: 验证部署

### 5.1 访问你的应用

1. 复制 Vercel 提供的 URL（例如 `https://your-project.vercel.app`）
2. 在浏览器中打开
3. 检查应用是否正确加载

### 5.2 功能测试

执行以下测试确保一切正常：

- [ ] 页面加载（检查是否有 JavaScript 错误）
- [ ] 用户登录（使用测试账户）
- [ ] 创建新评价（EvaluationForm）
- [ ] 查看仪表盘（Dashboard）
- [ ] 查看评价历史（EvaluationHistory）
- [ ] 创建新员工（WorkerManagement）
- [ ] 生成报告（ReportsSection）

### 5.3 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 检查 Console 选项卡
3. 确保没有红色错误信息

---

## 🔗 步骤 6: 配置自定义域名（可选）

### 6.1 在 Vercel 中添加域名

1. 在 Vercel 项目页面，进入 **Settings** → **Domains**
2. 输入你的域名（例如 `gsr.yourcompany.com`）
3. 点击 **Add**

### 6.2 配置 DNS

Vercel 会提供 DNS 配置说明。通常需要：

1. 访问你的域名注册商（GoDaddy, Namecheap 等）
2. 进入 DNS 管理
3. 添加 CNAME 记录，指向 Vercel 提供的地址
4. 等待 DNS 生效（可能需要 24 小时）

### 6.3 启用 HTTPS

Vercel 会自动为你的域名生成 SSL 证书。

---

## 🔄 步骤 7: 配置自动部署

### 7.1 启用自动部署

默认情况下，Vercel 已启用自动部署：

- 当你推送代码到 GitHub 时，Vercel 会自动部署
- 每个 push 都会触发新的部署

### 7.2 配置部署预览

对于 Pull Requests，Vercel 会自动创建预览部署：

- 创建 PR 时，Vercel 会生成临时 URL 用于测试
- 在 PR 页面上可以看到部署预览链接

---

## 🛠️ 故障排除

### 问题 1: 构建失败

**症状**: Vercel 显示构建失败

**解决方案**:
```bash
# 检查本地构建
npm run build

# 查看构建错误信息
# 修复问题后重新提交
git add .
git commit -m "fix: resolve build error"
git push origin main

# Vercel 会自动重新部署
```

### 问题 2: "Missing environment variables"

**症状**: 部署后应用崩溃，报错缺少环境变量

**解决方案**:
1. 检查 Vercel 项目设置中的环境变量
2. 确保变量名称完全匹配（区分大小写）
3. 确保没有多余空格
4. 重新部署 (Settings → Deployments → Redeploy)

### 问题 3: "Cannot read property 'x' of undefined"

**症状**: 页面加载时出现 JavaScript 错误

**解决方案**:
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页了解详细错误
3. 检查是否是 Supabase 连接问题
4. 验证环境变量是否正确设置

### 问题 4: Supabase 连接失败

**症状**: 应用无法连接到数据库

**解决方案**:
1. 验证 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`
2. 检查 Supabase 项目是否还在线
3. 验证 RLS 策略是否允许匿名访问
4. 在 Supabase 中检查数据库状态

### 问题 5: 登录后白屏

**症状**: 登录成功但页面不显示内容

**解决方案**:
1. 检查浏览器控制台中的错误
2. 验证 Supabase RLS 策略是否正确配置
3. 检查用户是否有正确的角色
4. 尝试清除浏览器 LocalStorage 并重新登录

---

## 📊 监控和维护

### 监控部署

访问 Vercel 项目页面，可以看到：

- **Deployments**: 所有部署历史
- **Analytics**: 性能数据和访问统计
- **Logs**: 构建和服务日志

### 监控应用性能

1. 访问 Vercel 项目页面
2. 进入 **Analytics** 标签
3. 查看性能指标：
   - Web Core Vitals
   - 请求数和响应时间
   - 地理位置分布

### 定期检查

- [ ] 每月检查 Supabase 使用配额
- [ ] 监控 Vercel 部署日志
- [ ] 定期测试登录和数据操作
- [ ] 备份重要数据

---

## 🔐 安全最佳实践

### 部署前清单

- [ ] 所有敏感密钥都移除出代码
- [ ] 使用环境变量存储配置
- [ ] `.env` 文件在 `.gitignore` 中
- [ ] 没有 `service_role` 密钥在客户端
- [ ] CORS 策略已正确配置

### 部署后安全检查

- [ ] 验证没有密钥在浏览器可见源码中
- [ ] 启用 Supabase RLS 策略
- [ ] 定期更新依赖包
- [ ] 监控异常访问模式
- [ ] 定期备份数据

---

## 📞 获取帮助

### 常用资源

- **Vercel 文档**: https://vercel.com/docs
- **Supabase 文档**: https://supabase.com/docs
- **React 文档**: https://react.dev
- **Vite 文档**: https://vitejs.dev

### 社区支持

- Vercel Discord: https://discord.gg/vercel
- Supabase Discord: https://discord.supabase.com
- Stack Overflow: 搜索 `vercel` 或 `supabase`

---

## ✨ 下一步

部署完成后，建议：

1. **配置自定义域名** (可选)
2. **设置监控告警** 用于异常检测
3. **配置 CDN** 加速静态资源
4. **定期更新依赖** 保持安全
5. **收集用户反馈** 持续改进

更多信息见 `NEXT_STEPS.md` 文件。

---

**祝贺！你的应用已成功部署到 Vercel！🎉**

---

*最后更新: 2025-11-17*
*版本: 1.0*

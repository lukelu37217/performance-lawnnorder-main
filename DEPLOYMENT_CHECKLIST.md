# ✅ Performance Lawn Order - 部署前检查清单

使用此清单确保部署顺利进行。在进行每个步骤前，请检查对应的复选框。

---

## 📋 本地准备阶段

### 代码版本控制

- [ ] **Git 仓库初始化** - 本地仓库已创建
- [ ] **远程仓库连接** - GitHub 仓库已创建并连接
- [ ] **所有更改已提交** - 运行 `git status` 确认无未提交文件
- [ ] **已推送到主分支** - 运行 `git push origin main` 完成推送
- [ ] **GitHub 仓库可访问** - 访问仓库 URL 确认可见所有文件

### 项目配置检查

- [ ] **package.json 存在** - 文件位于项目根目录
- [ ] **build 脚本正确** - 包含: `"build": "vite build"`
- [ ] **dev 脚本正确** - 包含: `"dev": "vite"`
- [ ] **preview 脚本正确** - 包含: `"preview": "vite preview"`
- [ ] **vite.config.ts 存在** - 包含构建配置
- [ ] **tsconfig.json 存在** - TypeScript 配置正确
- [ ] **tailwind.config.ts 存在** - Tailwind CSS 配置正确

### 环境变量配置

- [ ] **.env.example 已创建** - 位于项目根目录
- [ ] **.env.example 包含所有必需变量**:
  - [ ] `VITE_SUPABASE_PROJECT_ID`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] **.env.local 已创建** (仅本地，不提交)
- [ ] **.env.local 已填入真实值** - 使用你的 Supabase 凭证
- [ ] **.gitignore 包含环境文件**:
  - [ ] `.env`
  - [ ] `.env.local`
  - [ ] `.env.*.local`

### 硬编码值检查

- [ ] **Supabase URL 已参数化** - 使用 `import.meta.env.VITE_SUPABASE_URL`
- [ ] **Supabase 密钥已参数化** - 使用 `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] **没有发现硬编码的 API 密钥** - 运行代码搜索确认
- [ ] **没有发现硬编码的 URL** - 搜索 `https://` 验证

### 本地测试

- [ ] **安装依赖成功** - 运行 `npm install` 或 `npm ci`
- [ ] **本地开发启动成功** - 运行 `npm run dev`，应用在 http://localhost:8080 运行
- [ ] **登录页面可访问** - 访问本地应用，看到登录表单
- [ ] **本地构建成功** - 运行 `npm run build`，无错误
- [ ] **输出目录正确** - `dist/` 目录已创建，包含 `index.html`
- [ ] **预览构建成功** - 运行 `npm run preview`，应用正常工作
- [ ] **环境变量已加载** - 检查浏览器控制台，没有缺少环境变量的错误
- [ ] **数据库连接成功** - 应用能成功连接到 Supabase

### 功能验证

- [ ] **认证系统工作** - 能使用测试账户登录
- [ ] **仪表盘显示** - Dashboard 页面加载并显示数据
- [ ] **评价表单工作** - 能创建新的评价
- [ ] **员工管理工作** - 能查看和创建员工
- [ ] **数据查询工作** - 能查看评价历史
- [ ] **图表渲染** - Dashboard 的图表正常显示

---

## 📦 Supabase 准备阶段

### 项目设置

- [ ] **Supabase 账号已创建** - 访问 supabase.com 创建
- [ ] **项目已创建** - 项目 ID: `hzealevyevxabkrfxyod` (或你的 ID)
- [ ] **项目 URL 已记录** - `https://[project-id].supabase.co`
- [ ] **项目处于活跃状态** - 检查 Supabase Dashboard

### 数据库迁移

- [ ] **所有迁移已执行** - 在 Supabase 中运行 SQL 迁移
- [ ] **数据库表已创建**:
  - [ ] `users` 表
  - [ ] `profiles` 表
  - [ ] `user_roles` 表
  - [ ] `workers` 表
  - [ ] `foremen` 表
  - [ ] `managers` 表
  - [ ] `leaders` 表
  - [ ] `evaluations` 表
  - [ ] `reminder_configs` 表
- [ ] **表结构正确** - 所有字段和类型都如预期
- [ ] **索引已创建** - 提高查询性能

### 认证配置

- [ ] **Supabase Auth 已启用** - 在 Settings → Auth Providers
- [ ] **Email 认证已启用** - 用户可以注册
- [ ] **邮件确认已配置** (可选) - 账户验证流程

### RLS 策略配置

- [ ] **RLS 已启用** - 所有表启用行级安全
- [ ] **Admin 政策已配置** - Admin 用户可访问所有数据
- [ ] **Leader 政策已配置** - Leader 权限正确
- [ ] **Manager 政策已配置** - Manager 权限正确
- [ ] **Foreman 政策已配置** - Foreman 权限正确
- [ ] **Worker 政策已配置** - Worker 权限正确
- [ ] **RLS 测试通过** - 验证权限限制工作正确

### API 密钥

- [ ] **Anon/Public 密钥已复制** - 保存到安全位置
- [ ] **Service Role 密钥已记录** (仅服务端使用)
- [ ] **没有泄露任何密钥** - 密钥不在代码中

### Realtime 配置 (可选)

- [ ] **Realtime 已启用** (可选) - 实时数据同步
- [ ] **表已添加到 Realtime** - workers, foremen 等

---

## 🐙 GitHub 准备阶段

### 仓库设置

- [ ] **GitHub 账号已创建** - 有效的 GitHub 账户
- [ ] **新仓库已创建** - Performance Lawn Order 仓库存在
- [ ] **仓库是公开或私密** - 根据需要选择

### 代码推送

- [ ] **本地仓库已初始化** - 运行 `git init`
- [ ] **远程已添加** - 运行 `git remote add origin [url]`
- [ ] **所有文件已暂存** - 运行 `git add .`
- [ ] **代码已提交** - 运行 `git commit -m "Initial commit"`
- [ ] **代码已推送** - 运行 `git push origin main`
- [ ] **GitHub 显示所有文件** - 刷新仓库页面验证

### 敏感信息检查

- [ ] **.env 不在仓库中** - GitHub 上看不到 .env 文件
- [ ] **密钥不在代码中** - 搜索仓库确认没有硬编码密钥
- [ ] **.gitignore 正确** - 包含 `.env` 和敏感文件
- [ ] **提交历史干净** - 没有意外提交的密钥记录

### 仓库权限

- [ ] **仓库可以访问** - 有权限读写
- [ ] **Vercel 可以访问** - 稍后要给 Vercel 授权

---

## 🚀 Vercel 部署阶段

### Vercel 账号设置

- [ ] **Vercel 账号已创建** - vercel.com
- [ ] **GitHub 已连接到 Vercel** - 授权完成
- [ ] **Vercel 可以访问你的仓库** - 权限授予

### 项目导入

- [ ] **项目已添加到 Vercel** - Import Project → Select Repository
- [ ] **项目名称已设置** - 例如 `performance-lawn-order`
- [ ] **Root Directory 设置为 `.`** - 不需要更改
- [ ] **Framework Preset 设置为 `Vite`** - 自动检测

### 构建配置

- [ ] **Build Command: `npm run build`** - 正确设置
- [ ] **Output Directory: `dist`** - 正确设置
- [ ] **Install Command: `npm install`** - 正确设置
- [ ] **Development Command: `npm run dev`** - 正确设置

### 环境变量配置

在 Vercel 部署配置中添加：

- [ ] **VITE_SUPABASE_PROJECT_ID**
  - [ ] 变量名正确
  - [ ] 值正确
  - [ ] 没有多余空格
- [ ] **VITE_SUPABASE_URL**
  - [ ] 变量名正确
  - [ ] 值为 `https://[project-id].supabase.co`
  - [ ] 没有多余空格
- [ ] **VITE_SUPABASE_PUBLISHABLE_KEY**
  - [ ] 变量名正确
  - [ ] 值为 Supabase anon key
  - [ ] 没有多余空格

### 部署执行

- [ ] **部署开始** - 点击 Deploy 按钮
- [ ] **构建开始** - Vercel 开始构建应用
- [ ] **构建成功** - 没有构建错误，显示绿色勾
- [ ] **部署完成** - 应用已部署到 Vercel

### 部署后验证

- [ ] **部署 URL 生成** - 例如 `https://your-app.vercel.app`
- [ ] **应用可访问** - 在浏览器打开部署 URL
- [ ] **页面加载** - HTML 页面成功加载
- [ ] **资源加载** - CSS 和 JavaScript 都加载成功

---

## 🧪 功能测试阶段

### 基础功能

- [ ] **页面加载无错误** - 检查浏览器控制台
- [ ] **应用样式正确** - UI 显示正常
- [ ] **响应式设计工作** - 在不同屏幕尺寸下显示正确
- [ ] **导航菜单工作** - 可以点击菜单项切换页面

### 认证功能

- [ ] **登录页面显示** - 访问应用时看到登录表单
- [ ] **可以注册新账户** - 填写注册表单，成功注册
- [ ] **可以登录** - 使用注册的账户登录
- [ ] **登录后重定向** - 成功登录后进入 Dashboard
- [ ] **登出工作** - 点击登出后返回登录页
- [ ] **密码重置工作** - 可以申请密码重置

### 数据操作

- [ ] **可以创建员工** - WorkerManagement 页面工作
- [ ] **可以查看员工列表** - 员工显示在列表中
- [ ] **可以编辑员工** - 修改员工信息成功
- [ ] **可以删除员工** - 删除员工成功
- [ ] **可以创建评价** - EvaluationForm 提交成功
- [ ] **可以查看评价历史** - EvaluationHistory 显示数据
- [ ] **可以编辑评价** - 修改评价数据成功

### 仪表盘和报告

- [ ] **Dashboard 加载** - 显示性能数据
- [ ] **图表渲染** - 柱状图、饼图、折线图显示
- [ ] **过滤器工作** - 可以过滤数据
- [ ] **散点图显示** - PerformanceScatterPlot 工作
- [ ] **报告生成** - 可以生成 PDF 报告

### 数据持久化

- [ ] **数据保存到数据库** - 创建的数据在页面刷新后仍存在
- [ ] **数据在列表中显示** - 新创建的记录出现在列表中
- [ ] **编辑被保存** - 修改的数据正确保存
- [ ] **删除被保存** - 删除的数据不再显示

### 浏览器控制台

- [ ] **没有红色错误** - 检查 Console 标签页
- [ ] **没有警告信息** - 警告信息应该是最小的
- [ ] **网络请求成功** - Network 标签页没有红色失败请求
- [ ] **没有 CORS 错误** - Supabase 请求都成功

---

## 🔍 生产检查阶段

### 性能检查

- [ ] **页面加载快速** - 首屏加载 < 3 秒
- [ ] **交互响应快** - 点击按钮有快速反应
- [ ] **没有冻屏** - 页面交互流畅
- [ ] **图表性能好** - 图表渲染快速

### 安全检查

- [ ] **HTTPS 已启用** - URL 显示 🔒 锁
- [ ] **密钥不在源代码** - 检查浏览器 Sources 标签
- [ ] **没有敏感信息在 LocalStorage** - 检查浏览器 Application 标签
- [ ] **CSP 头已配置** - vercel.json 中有安全头配置

### 访问检查

- [ ] **应用可以从任何地方访问** - 不同网络测试
- [ ] **移动端访问工作** - 用手机测试
- [ ] **平板端访问工作** - 用平板测试
- [ ] **不同浏览器兼容** - Chrome, Firefox, Safari 等测试

---

## 📞 故障排查

如果出现问题，按以下步骤排查：

### 构建失败

- [ ] 查看 Vercel 构建日志获取错误信息
- [ ] 在本地运行 `npm run build` 重现错误
- [ ] 修复错误并推送更新
- [ ] Vercel 应该自动重新部署

### 环境变量问题

- [ ] 检查 Vercel Settings → Environment Variables
- [ ] 验证变量名完全匹配（区分大小写）
- [ ] 检查变量值没有多余空格
- [ ] 点击 Redeploy 强制重新部署

### 数据库连接失败

- [ ] 验证 Supabase 项目是否在线
- [ ] 检查 Supabase URL 和密钥是否正确
- [ ] 验证 RLS 策略是否允许当前用户访问
- [ ] 查看浏览器开发者工具 Network 标签了解具体错误

### 页面显示空白

- [ ] 检查浏览器控制台的 JavaScript 错误
- [ ] 检查 Vercel 部署日志
- [ ] 验证所有环境变量都已设置
- [ ] 尝试清空浏览器缓存并刷新

---

## ✨ 部署完成标志

当所有以下条件都满足时，部署完成：

- ✅ 应用在 Vercel 上线并可访问
- ✅ 所有环境变量正确配置
- ✅ 功能测试全部通过
- ✅ 没有控制台错误
- ✅ 数据库连接正常
- ✅ 用户可以登录和使用应用

---

## 📊 部署信息记录

部署完成后，记录以下信息以备后用：

```
应用名称: Performance Lawn Order
部署日期: ________________
Vercel URL: ________________
自定义域名: ________________
Supabase 项目 ID: hzealevyevxabkrfxyod
部署人: ________________
备注: ________________
```

---

## 🎉 恭喜！

如果你已完成所有检查项，那么你的应用已准备好部署到生产环境了！

更多信息见 `DEPLOY.md` 文件。

---

*最后更新: 2025-11-17*
*版本: 1.0*

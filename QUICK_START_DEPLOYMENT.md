# ⚡ 快速部署指南（5 分钟速成）

如果你赶时间，这就是你需要知道的一切。详细信息见 `DEPLOY.md`。

---

## 📋 3 分钟准备

```bash
# Step 1: 更新本地 .env 文件
cp .env.example .env.local
# 编辑 .env.local，填入你的 Supabase 凭证：
# - VITE_SUPABASE_PROJECT_ID = hzealevyevxabkrfxyod
# - VITE_SUPABASE_URL = https://hzealevyevxabkrfxyod.supabase.co
# - VITE_SUPABASE_PUBLISHABLE_KEY = your_anon_key

# Step 2: 验证本地构建
npm install
npm run build
npm run preview
# 访问 http://localhost:4173 测试

# Step 3: 推送到 GitHub
git add .
git commit -m "chore: deployment ready"
git push origin main
```

---

## 🚀 2 分钟部署

1. **访问**: https://vercel.com
2. **登录**: 用 GitHub 账号
3. **导入**: 选择你的仓库
4. **配置**:
   - Framework: Vite
   - Build: npm run build
   - Output: dist
5. **环境变量** (添加 3 个):
   - `VITE_SUPABASE_PROJECT_ID` = hzealevyevxabkrfxyod
   - `VITE_SUPABASE_URL` = https://hzealevyevxabkrfxyod.supabase.co
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (你的 anon key)
6. **点击**: Deploy 按钮
7. **等待**: 2-3 分钟

---

## ✅ 验证部署（1 分钟）

```
1. 打开 Vercel 给你的 URL
2. 登录测试
3. 检查浏览器 F12 → Console，无红色错误
4. 完成！🎉
```

---

## ⚠️ 最常见的 3 个问题

### 问题 1: "Missing environment variable"
```
✅ 解决: 检查 Vercel Settings → Environment Variables
确保变量名完全匹配（包括大小写）
```

### 问题 2: "Cannot GET /"
```
✅ 解决: vercel.json 中已有 SPA 重写规则，应该没问题
如果还是有问题，检查 vercel.json 是否在根目录
```

### 问题 3: 白屏显示
```
✅ 解决: 打开 F12 → Console 查看错误信息
检查环境变量是否正确设置
```

---

## 📚 完整指南在哪里？

| 你需要... | 查看文件 |
|---------|--------|
| 详细步骤 | `DEPLOY.md` |
| 完整检查表 | `DEPLOYMENT_CHECKLIST.md` |
| 时间表和计划 | `NEXT_STEPS.md` |
| 部分摘要 | `DEPLOYMENT_SUMMARY.md` |

---

## 🔑 关键文件

已为你准备的文件：

```
✅ vercel.json           - Vercel 配置
✅ .env.example          - 环境变量模板
✅ vite.config.ts        - 已优化的构建配置
✅ .gitignore            - 已保护敏感文件
✅ client.ts             - 已修复硬编码密钥
```

---

## 🎯 你现在能做什么

- ✅ 立即部署（3-5 分钟）
- ✅ 按照详细指南部署（DEPLOY.md）
- ✅ 完成完整检查清单（DEPLOYMENT_CHECKLIST.md）

---

## 💬 遇到问题？

1. 查看 `DEPLOY.md#故障排除`
2. 检查 Vercel 部署日志
3. 验证环境变量
4. 尝试本地 `npm run build`

---

**准备好了吗？开始部署吧！🚀**

需要详细信息？📖 [查看 DEPLOY.md](./DEPLOY.md)

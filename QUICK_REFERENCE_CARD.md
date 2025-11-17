# ⚡ 快速参考卡 - 3 步修复

## 问题
```
网站显示 "Invalid email or password"
dylan@lawnorder.ca 不存在
```

## 解决方案: 3 步

### 🔐 步骤 1: 创建 Supabase Auth 用户 (5 min)

```
https://supabase.com/dashboard/project/hzealevyevxabkrfxyod
  ↓
Authentication → Users
  ↓
Add user
  ↓
Email: dylan@lawnorder.ca
Password: dylan1234
✅ Auto Confirm user
  ↓
Save
```

### 📊 步骤 2: 运行 SQL 数据脚本 (3 min)

```
SQL Editor → New Query
  ↓
复制 setup-real-data.sql
  ↓
粘贴
  ↓
Run ✅
```

### 🧹 步骤 3: 清空缓存并登录 (2 min)

```
Ctrl + Shift + Delete (清空缓存)
  ↓
Ctrl + Shift + R (硬刷新)
  ↓
https://lawnorder-performance.vercel.app/
  ↓
Email: dylan@lawnorder.ca
Password: dylan1234
  ↓
Login ✅
```

---

## 结果

```
✅ 登录成功
✅ 显示 Brian 团队
✅ 显示 Max, Dusty, Rana, Lucas, Daria Foremen
✅ 显示 15 个 Workers
✅ 系统完全可用
```

---

## 关键信息

| 项目 | 值 |
|------|-----|
| **测试邮箱** | dylan@lawnorder.ca |
| **测试密码** | dylan1234 |
| **项目 URL** | https://lawnorder-performance.vercel.app/ |
| **Supabase 项目** | hzealevyevxabkrfxyod |
| **SQL 脚本** | setup-real-data.sql |
| **预计时间** | 10 分钟 |

---

## 如果出问题

| 问题 | 解决方案 |
|------|--------|
| 还是无法登录 | 检查邮箱/密码是否正确，清空缓存 |
| Dashboard 空白 | 检查 SQL 脚本是否运行成功 |
| 看不到 "Add user" 按钮 | 刷新页面或检查权限 |
| 邮箱已存在 | 使用不同的邮箱或删除现有用户 |

---

## 文档索引

```
SUPABASE_USER_CREATION_STEPS.md  ← 创建用户详细步骤 👈 首先读这个
setup-real-data.sql              ← 数据脚本 👈 然后运行这个
FINAL_SUMMARY_AND_ACTION_PLAN.md  ← 完整总结
QUICK_REFERENCE_CARD.md           ← 这个文件（快速参考）
```

---

**立即开始:**
1. 打开 `SUPABASE_USER_CREATION_STEPS.md`
2. 按步骤操作
3. 10 分钟后系统就绪 🎉


# 📝 创建测试账户 - Supabase Auth 用户

## 问题说明

你看到 "Invalid email or password" 错误是因为：
- dylan@lawnorder.ca **不存在** 在 Supabase Auth 中
- 需要手动创建这个账户

---

## 解决方案：创建 Supabase Auth 用户

### 步骤 1: 打开 Supabase Dashboard

Go to: https://supabase.com/dashboard/project/hzealevyevxabkrfxyod

点击左侧菜单: **Authentication**

---

### 步骤 2: 进入 Users 管理

在 Authentication 菜单下，点击: **Users**

你应该看到已有的用户列表 (可能是空的或有其他用户)

---

### 步骤 3: 添加新用户

点击右上角绿色按钮: **Add user** 或 **+ Create new user**

---

### 步骤 4: 填写用户信息

在弹出的表单中填写:

| 字段 | 值 |
|------|-----|
| **Email** | `dylan@lawnorder.ca` |
| **Password** | `dylan1234` |
| **Confirm Password** | `dylan1234` |
| **Auto Confirm user** | ✅ 勾选 (跳过邮箱验证) |

---

### 步骤 5: 保存用户

点击: **Save**

你应该看到成功提示: "User created successfully"

---

### 步骤 6: 验证创建成功

用户现在应该出现在 Users 列表中，显示：
- Email: `dylan@lawnorder.ca`
- Created: 今天的日期

---

## 然后运行数据 SQL 脚本

创建用户后，在 Supabase SQL Editor 运行:

**File:** `setup-real-data.sql`

这个脚本会：
- ✅ 创建组织层级 (Leaders, Foremen, Workers)
- ✅ 链接 dylan 用户到 Max Foreman
- ✅ 设置所有的人员关系

---

## 最终测试

账户创建 + SQL 运行后，访问:

```
URL: https://lawnorder-performance.vercel.app/
Email: dylan@lawnorder.ca
Password: dylan1234
```

**预期结果:** ✅ 登录成功，显示完整 dashboard

---

## 如果 "Add user" 按钮不可见

### 方案 A: 使用命令行 (更快)

在你的电脑终端运行:

```bash
# 确保你在项目目录
cd "c:\Users\82692\Downloads\performance-lawnnorder-main\performance-lawnnorder-main"

# 使用 Supabase CLI 创建用户
supabase auth users create \
  --email dylan@lawnorder.ca \
  --password dylan1234 \
  --project-id hzealevyevxabkrfxyod
```

### 方案 B: 使用 API 直接调用

在 SQL Editor 运行这个查询:

```sql
-- 这会通过数据库触发器创建用户
-- 但需要数据库有相应的权限和函数
-- (通常不推荐，用方案 A 更好)
```

---

## 其他可选账户

如果你想为其他 Foreman 创建账户：

| Foreman | 邮箱建议 | 密码 |
|---------|---------|------|
| Max | `max@lawnorder.ca` | `max1234` |
| Dusty | `dusty@lawnorder.ca` | `dusty1234` |
| Rana | `rana@lawnorder.ca` | `rana1234` |
| Lucas | `lucas@lawnorder.ca` | `lucas1234` |
| Daria | `daria@lawnorder.ca` | `daria1234` |

---

## 创建账户时的常见问题

### Q: 邮箱已存在怎么办？

A: 如果看到 "User already exists" 错误:
1. 点击用户列表中的该用户
2. 删除或重置密码
3. 或使用不同的邮箱

### Q: "Auto Confirm user" 选项是什么？

A:
- ✅ 勾选 = 用户立即可用 (跳过邮箱验证)
- ❌ 不勾选 = 用户需要验证邮箱才能用 (我们不需要)

### Q: 为什么要勾选 "Auto Confirm user"？

A: 因为这是测试环境，你没有邮箱验证系统设置。在生产环境中，通常不勾选。

---

## 流程总结

```
1. 创建 Supabase Auth 用户 (1分钟)
   dylan@lawnorder.ca / dylan1234
   ↓
2. 运行 setup-real-data.sql (3分钟)
   创建组织结构和人员关系
   ↓
3. 清空浏览器缓存 (1分钟)
   Ctrl + Shift + Delete
   ↓
4. 硬刷新网页 (30秒)
   Ctrl + Shift + R
   ↓
5. 测试登录 (1分钟)
   dylan@lawnorder.ca / dylan1234
   ↓
6. 🎉 系统就绪！
```

**总时间:** ~6 分钟

---

## 下一步

1. ✅ 按上述步骤创建 dylan@lawnorder.ca 账户
2. ✅ 运行 `setup-real-data.sql` (参考 QUICK_FIX_GUIDE.md)
3. ✅ 清空缓存和硬刷新
4. ✅ 测试登录

完成后你的系统就完全可用了！


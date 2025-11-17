# 🔐 Authentication System Setup Guide

## Database Architecture Overview

Your system uses **Supabase Auth (JWT)** with **custom database tables**.

### Table Relationships:

```
┌─ Supabase Auth ─────────────────┐
│ (External JWT System)            │
│                                  │
│ Users:                           │
│  - id: UUID (stored in auth.     │
│  - email: unique                 │
│  - password: hashed              │
└──────────────────────────────────┘
         ↓ (creates on signup)
┌─ profiles table ────────────────┐
│ (created by trigger)             │
│                                  │
│ - id: UUID (links to auth)       │
│ - name: text                     │
│ - entity_id: nullable            │
└──────────────────────────────────┘
         ↓ (linked to)
┌─ user_roles table ──────────────┐
│ (stores role assignments)        │
│                                  │
│ - user_id: UUID (auth id)        │
│ - role: enum (admin|leader|...)  │
└──────────────────────────────────┘
         ↓ (role determines access to)
┌─ Organizational Hierarchy ──────┐
│ leaders → managers → foremen    │
│                    → workers    │
│                                  │
│ evaluations (performance data)  │
└──────────────────────────────────┘
```

## Current Issues

### 1. Legacy `users` table (NOT USED)
```sql
-- This table exists but is ignored by the current app
SELECT * FROM users;
-- Only used by old AuthContext, not SupabaseAuthContext
```

**Action:** Delete or ignore this table. Use Supabase Auth instead.

### 2. Missing Organizational Data
The app successfully authenticates but shows empty dashboard because these tables are empty:
- `leaders` - empty
- `managers` - empty
- `foremen` - empty
- `workers` - empty

### 3. No User-to-Organization Linking
After login, the user profile has `entity_id = NULL`, so they're not linked to any organization.

---

## ✅ Setup Instructions

### Step 1: Clean Up (Optional)

If you want to keep your database clean, delete the legacy `users` table:

```sql
-- In Supabase SQL Editor:
DROP TABLE IF EXISTS users CASCADE;
```

**Note:** Only do this if you're sure you want to use Supabase Auth exclusively.

### Step 2: Add Test Data via Supabase Console

#### 2.1: Create Test User in Supabase Auth

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. Click **"Add user"**
3. Email: `dylan@lawnorder.ca`
4. Password: `dylan1234`
5. Click **Save**

✅ This creates entry in Supabase Auth + profiles table automatically

#### 2.2: Create Organizational Hierarchy (via SQL Editor)

Go to **SQL Editor** and run this script:

```sql
-- 1. Create Leaders
INSERT INTO leaders (name) VALUES ('Brian Davidson') RETURNING *;
-- Returns: leader_id (save this)

-- 2. Create Managers (under the leader)
INSERT INTO managers (name, leader_id) VALUES
  ('John Manager', 'LEADER_ID_FROM_STEP1') RETURNING *;
-- Returns: manager_id (save this)

-- 3. Create Foremen (under the manager)
INSERT INTO foremen (name, manager_id) VALUES
  ('Dylan Foreman', 'MANAGER_ID_FROM_STEP2') RETURNING *;
-- Returns: foreman_id (save this)

-- 4. Create Workers (under the foreman)
INSERT INTO workers (name, foreman_id) VALUES
  ('Worker One', 'FOREMAN_ID_FROM_STEP3'),
  ('Worker Two', 'FOREMAN_ID_FROM_STEP3'),
  ('Worker Three', 'FOREMAN_ID_FROM_STEP3') RETURNING *;
```

#### 2.3: Link Your Test User to Organization

After getting `leader_id` from the user you want to assign to:

```sql
-- Update profiles to link user to organization
UPDATE profiles
SET entity_id = 'LEADER_ID_FROM_STEP2_1'
WHERE name = 'dylan';

-- Update user_roles to set them as leader
UPDATE user_roles
SET role = 'leader'
WHERE user_id = (SELECT id FROM profiles WHERE name = 'dylan');
```

---

## 🧪 Testing the Full Flow

### Test 1: Login
```
1. Go to https://lawnorder-performance.vercel.app/
2. Email: dylan@lawnorder.ca
3. Password: dylan1234
4. Expected: Should log in successfully
```

### Test 2: See Dashboard
```
1. After login, should see:
   - User welcome message with name "dylan"
   - Navigation menu
   - Dashboard with organizational hierarchy
   - Leaders, managers, foremen, workers listed
```

### Test 3: Role-Based Access
```
Depending on the role assigned to dylan:
- leader: Can see all teams, evaluate managers/foremen
- manager: Can see assigned team, evaluate foremen/workers
- foreman: Can see assigned workers, evaluate workers
- admin: Full system access
```

---

## 🔧 Troubleshooting

### Issue: Login succeeds but dashboard is empty

**Cause:** User is authenticated but not linked to organization
**Fix:** Run the linking SQL from Step 2.3 above

### Issue: Can't find user_id for the profile

**Query to find it:**
```sql
SELECT id FROM auth.users WHERE email = 'dylan@lawnorder.ca';
-- Use this id in user_roles update
```

### Issue: Still seeing blank dashboard

**Debug steps:**
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE name = 'dylan';

-- Check if role exists
SELECT * FROM user_roles WHERE user_id = 'USER_ID';

-- Check if entity_id is set
SELECT * FROM profiles WHERE entity_id IS NOT NULL;
```

---

## 📋 Quick SQL Setup Script

Run all at once in Supabase SQL Editor:

```sql
-- 1. Create Leaders
INSERT INTO leaders (name) VALUES ('Brian Davidson') RETURNING id as leader_id;

-- 2. Create Managers
INSERT INTO managers (name, leader_id) VALUES
  ('John Manager', '[REPLACE_WITH_LEADER_ID]') RETURNING id as manager_id;

-- 3. Create Foremen
INSERT INTO foremen (name, manager_id) VALUES
  ('Dylan Foreman', '[REPLACE_WITH_MANAGER_ID]') RETURNING id as foreman_id;

-- 4. Create Workers
INSERT INTO workers (name, foreman_id) VALUES
  ('Worker One', '[REPLACE_WITH_FOREMAN_ID]'),
  ('Worker Two', '[REPLACE_WITH_FOREMAN_ID]'),
  ('Worker Three', '[REPLACE_WITH_FOREMAN_ID]');

-- 5. Create evaluations (sample)
INSERT INTO evaluations
  (evaluator_id, evaluator_role, evaluatee_type, worker_id, foreman_id,
   evaluation_date, period, scores, total_score, rating, biweekly_period)
VALUES
  ('072fd764-7440-4793-af6e-c364e590a159', 'leader', 'worker',
   '[WORKER_ID]', '[FOREMAN_ID]', NOW(), 'biweekly',
   '{
     "projectCompletion": 9,
     "qualityIssues": 8,
     "toolCare": 7,
     "equipmentEtiquette": 8,
     "nearMiss": 7,
     "incident": 10,
     "attendance": 10,
     "attitude": 9,
     "taskOwnership": 8,
     "customerInteraction": 9,
     "teamwork": 8
   }'::jsonb,
   93,
   'A',
   47);
```

---

## 🎯 Next Steps

1. **Verify Supabase Connection** (already done ✅)
2. **Add Test Data** (follow Step 2 above)
3. **Test Login** (follow Test 1)
4. **Test Dashboard** (follow Test 2)
5. **Test Functionality** (follow Test 3)
6. **Deploy to Vercel** (git push)

---

## 📞 Need Help?

If something doesn't work:

1. Check browser console for errors
2. Check Supabase logs: Dashboard > Logs
3. Verify environment variables on Vercel
4. Check RLS policies: Dashboard > Authentication > Policies

---

*Last updated: November 17, 2025*

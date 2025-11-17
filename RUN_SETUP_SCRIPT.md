# 🚀 How to Run the Setup Script

## Quick Start (3 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/hzealevyevxabkrfxyod
2. Click **SQL Editor** (left sidebar)
3. Click **New Query** (or the **+** button)

### Step 2: Copy the SQL Script

Open the file: `setup-test-data.sql` from your project

Copy ALL the content (or select lines 1-235 as shown in your selection)

### Step 3: Paste into SQL Editor

1. In Supabase SQL Editor, paste the entire script
2. You should see the script loaded in the editor

### Step 4: Run the Script

Click the green **"Run"** button in the bottom right

### Step 5: Verify Success

You should see results like:
```
Query execution completed
```

No errors should appear. If you see errors, check the error message below.

---

## What the Script Does

Running `setup-test-data.sql` will:

✅ **Create 1 Leader**
- Brian Davidson

✅ **Create 2 Managers**
- John Smith Manager (under Brian)
- Sarah Johnson Manager (under Brian)

✅ **Create 3 Foremen**
- Dylan Foreman (under John Smith Manager)
- Mike Thompson Foreman (under Sarah Johnson Manager)
- David Martinez Foreman (independent, no manager)

✅ **Create 5 Workers**
- Worker One → Dylan Foreman
- Worker Two → Dylan Foreman
- Worker Three → Dylan Foreman
- Worker Four → Mike Thompson Foreman
- Worker Five → Mike Thompson Foreman

✅ **Create 3 Sample Evaluations**
- Worker One: Rating A, Score 93
- Worker Two: Rating B, Score 89
- Worker Three: Rating B, Score 80

✅ **Link Dylan User to Organization**
- Connects dylan profile to Dylan Foreman
- Sets role to 'foreman'

---

## Test After Setup

### Test 1: Login

```
URL: https://lawnorder-performance.vercel.app/
Email: dylan@lawnorder.ca
Password: dylan1234
```

**Expected:** Login succeeds ✅

### Test 2: Dashboard

After login, you should see:
- Welcome message with name "dylan"
- Organization hierarchy (Brian → John → Dylan Foreman → Workers)
- List of workers under Dylan
- Evaluation records

**Expected:** All data visible ✅

---

## If Something Goes Wrong

### Error: "Failed to run sql query"

**Possible causes:**
1. Script syntax error (fixed in v2)
2. RLS policy blocking write
3. Duplicate data (run again, it will skip duplicates)

**Solution:**
1. Try again - the script uses `ON CONFLICT DO NOTHING`
2. Check database permissions
3. Run verification queries (see below)

### Verify Data Was Created

Run these queries in SQL Editor one at a time:

```sql
-- Check 1: Leaders created?
SELECT COUNT(*) as leader_count FROM leaders;
-- Expected: 1

-- Check 2: Managers created?
SELECT COUNT(*) as manager_count FROM managers;
-- Expected: 2

-- Check 3: Foremen created?
SELECT COUNT(*) as foreman_count FROM foremen;
-- Expected: 3

-- Check 4: Workers created?
SELECT COUNT(*) as worker_count FROM workers;
-- Expected: 5

-- Check 5: Evaluations created?
SELECT COUNT(*) as evaluation_count FROM evaluations;
-- Expected: 3

-- Check 6: Dylan linked?
SELECT entity_id, role FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.name = 'dylan';
-- Expected: entity_id = some UUID, role = 'foreman'
```

---

## Complete Flow After Setup

```
1. Run setup-test-data.sql ← YOU ARE HERE
   ↓
2. Wait 1 minute for database sync
   ↓
3. Login with dylan@lawnorder.ca / dylan1234
   ↓
4. Dashboard loads with organizational hierarchy
   ↓
5. View workers and evaluations
   ↓
6. Create new evaluations (if you want to test that)
```

---

## Next Steps

After successful setup:

1. ✅ Login and test the dashboard
2. ✅ Try creating a new evaluation
3. ✅ Test other user roles (if you create them)
4. ✅ Replace favicon with your custom logo
5. ✅ Deploy to production

---

**Need more help?** Check the detailed documentation:
- `AUTHENTICATION_SETUP_GUIDE.md` - Complete setup guide
- `AUTH_FLOW_DETAILED_ANALYSIS.md` - Technical deep dive


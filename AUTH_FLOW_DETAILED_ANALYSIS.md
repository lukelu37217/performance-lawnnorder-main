# 🔍 Authentication Flow - Detailed Analysis

## The Problem You're Experiencing

When you signup as a new user, **login succeeds but the dashboard shows nothing**.

This happens because of a **mismatch between the authentication layer and the application layer**.

---

## Current Flow (What Happens Now)

### Signup Flow:

```
1. User clicks "Register New Account"
   ↓
2. RegistrationForm validates:
   - Email format
   - Password strength (12+ chars, uppercase, number)
   ↓
3. SupabaseAuthContext.signUp() is called
   ↓
4. supabase.auth.signUp() creates user in Supabase Auth
   │
   ├─→ Creates: auth.users table entry
   │   - id: UUID (auto-generated)
   │   - email: validated
   │   - password_hash: bcrypted
   │
   └─→ Triggers database trigger:
       - Creates: profiles table entry
       - Sets: profiles.id = auth user ID
       - Sets: profiles.name from signup data
       - Sets: profiles.entity_id = NULL ⚠️ PROBLEM!

5. SupabaseAuthContext then manually inserts into user_roles:
   - Sets: role = 'foreman' (hardcoded)

6. Wait 1 second, then user can login
   ↓
7. USER IS NOW AUTHENTICATED ✅
```

### Login Flow:

```
1. User enters email/password
   ↓
2. SupabaseAuthContext.signIn() calls supabase.auth.signInWithPassword()
   ↓
3. Supabase Auth validates and creates session
   │
   ├─→ Sets: session.user.id = their UUID
   ├─→ Sets: session.user.email
   └─→ Session stored in browser

4. onAuthStateChange listener fires
   │
   ├─→ Calls: loadUserProfile(session.user.id)
   │   │
   │   ├─→ Query: SELECT name, entity_id FROM profiles WHERE id = UUID
   │   │   Result: { name: "luke", entity_id: NULL } ✅
   │   │
   │   └─→ Query: SELECT role FROM user_roles WHERE user_id = UUID
   │       Result: { role: "foreman" } ✅
   │
   └─→ Sets: user context = {
         id: UUID,
         name: "luke",
         entityId: null,     ⚠️ PROBLEM!
         role: "foreman"
       }

5. User is authenticated and app renders Dashboard
   ↓
6. DASHBOARD SHOWS NOTHING ❌
   Why? Because the app tries to load organizational data
   but entityId is NULL, so no organization is found!
```

---

## Why Dashboard Is Empty

When you login, the app's Dashboard component tries to:

```javascript
// In Dashboard or related components:
if (user.entityId) {
  // Load organizational hierarchy for this entity
  const hierarchy = await loadOrganizationalHierarchy(user.entityId);
} else {
  // entityId is NULL → nothing to load
  // Dashboard renders empty
}
```

The `entity_id` field should point to:
- **If role is 'foreman'**: Should point to foremen table id
- **If role is 'manager'**: Should point to managers table id
- **If role is 'leader'**: Should point to leaders table id
- **If role is 'admin'**: Should be NULL (admin sees all)

**But currently**: All new users get `entity_id = NULL`

---

## The Fix

### Option A: Set entity_id During Signup (Recommended)

Modify `SupabaseAuthContext.tsx` signup to link user to organization:

```typescript
const signUp = async (email: string, password: string, name: string) => {
  try {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name },
      },
    });

    if (error) {
      return { error: new Error('Sign up failed.') };
    }

    if (data.user) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to auto-link to organization
      const { data: foremenData } = await supabase
        .from('foremen')
        .select('id')
        .ilike('name', `%${name}%`)
        .single();

      // Set default entity (or link to matching foreman)
      const entityId = foremenData?.id || null;

      // Update profiles with entity_id
      await supabase
        .from('profiles')
        .update({ entity_id: entityId })
        .eq('id', data.user.id);

      // Set role as foreman
      await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'foreman' });
    }

    return { error: null };
  } catch (err) {
    return { error: new Error('Sign up failed.') };
  }
};
```

### Option B: Require Admin to Link Users (More Control)

Create an admin panel where admins:
1. Create user account (via UI)
2. Assign them to organization/role
3. Send invite link to user

This is better for production but more complex.

### Option C: Manual Linking (Temporary)

For now, use the SQL script provided:

```sql
-- Manually link user to organization
UPDATE profiles
SET entity_id = (SELECT id FROM foremen WHERE name = 'Dylan Foreman')
WHERE name = 'dylan';

UPDATE user_roles
SET role = 'foreman'
WHERE user_id = (SELECT id FROM profiles WHERE name = 'dylan');
```

---

## Why Signup to Existing User in Auth Doesn't Work

When you tried to:
> "add user in authenticator, then use for registration"

This doesn't work because:

```
Supabase Auth (JWT system)
    ↓
    ├─→ Pre-created user: dylan@lawnorder.ca / dylan1234
    │
    └─→ When someone tries to signup with same email:
        └─→ Error: "User already exists"

        (Auth prevents duplicate accounts)
```

Instead, you should:

```
Option 1: Pre-create in Auth, then user logs in directly
  - Go to Auth > Users
  - Add: dylan@lawnorder.ca / dylan1234
  - User visits app and logs in
  - Works! ✅

Option 2: User signs up normally
  - User visits app
  - Clicks "Register"
  - Enters email and password
  - Account created automatically in Auth
  - Works! ✅

Option 3: Mix (problematic)
  - Pre-create in Auth
  - User tries to signup with same email
  - Error: user already exists
  - Doesn't work ❌
```

---

## Database Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Supabase Auth (Built-in, external to Postgres)                  │
│                                                                  │
│ users (in auth schema)                                          │
│ ├─ id: UUID                                                     │
│ ├─ email: text (unique)                                         │
│ └─ password_hash: text                                          │
└─────────────────────────────────────────────────────────────────┘
        │
        │ (trigger on insert: auth.users → public.profiles)
        ↓
┌─────────────────────────────────────────────────────────────────┐
│ public.profiles (Auth integration table)                        │
│                                                                  │
│ ├─ id: UUID (= auth.users.id)                                   │
│ ├─ email: text (from auth.users)                                │
│ ├─ name: text (from signup data)                                │
│ ├─ entity_id: UUID (SHOULD link to leader/manager/foreman)      │
│ ├─ created_at: timestamp                                        │
│ └─ updated_at: timestamp                                        │
└─────────────────────────────────────────────────────────────────┘
        │
        └─→ 1:1 relationship
            │
            ├─→ (if foreman role)
            │   └─→ foremen.id
            │
            ├─→ (if manager role)
            │   └─→ managers.id
            │
            └─→ (if leader role)
                └─→ leaders.id

┌─────────────────────────────────────────────────────────────────┐
│ public.user_roles (Role assignment table)                       │
│                                                                  │
│ ├─ id: UUID (pk)                                                │
│ ├─ user_id: UUID (= profiles.id)                                │
│ ├─ role: enum (admin | leader | manager | foreman)              │
│ └─ created_at: timestamp                                        │
└─────────────────────────────────────────────────────────────────┘
        │
        └─→ Role determines permissions in app

┌─────────────────────────────────────────────────────────────────┐
│ Organizational Hierarchy Tables                                  │
│                                                                  │
│ leaders                managers             foremen            │
│ ├─ id                  ├─ id                ├─ id               │
│ ├─ name                ├─ name              ├─ name             │
│ └─ created_at          ├─ leader_id ────────┼─→ id              │
│                        └─ created_at        ├─ manager_id ─────→│
│                                             └─ created_at       │
│
│ workers
│ ├─ id
│ ├─ name
│ ├─ foreman_id ──────────────→ foremen.id
│ └─ created_at
│
│ evaluations
│ ├─ id
│ ├─ worker_id ──────────→ workers.id
│ ├─ foreman_id ─────────→ foremen.id
│ ├─ evaluator_id ───────→ profiles.id
│ ├─ evaluator_role
│ ├─ evaluatee_type
│ ├─ scores (JSON)
│ ├─ rating
│ └─ ... (other fields)
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Complete Test Scenario

### Scenario 1: Pre-Created User (Quick Test)

1. **In Supabase Dashboard:**
   - Go to Auth > Users
   - Add: `test@example.com` / `password123`

2. **In Supabase SQL Editor:**
   ```sql
   -- Link to organization
   UPDATE profiles
   SET entity_id = (SELECT id FROM foremen LIMIT 1)
   WHERE email = 'test@example.com';

   UPDATE user_roles
   SET role = 'foreman'
   WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com');
   ```

3. **Test Login:**
   - Email: `test@example.com`
   - Password: `password123`
   - Expected: Logs in, sees dashboard ✅

### Scenario 2: New Registration (Full Flow)

1. **In App:**
   - Click "Register New Account"
   - Email: `newuser@example.com`
   - Password: `TempPass123`
   - Name: `John Doe`
   - Click Register

2. **In Supabase SQL Editor:**
   ```sql
   -- Link new user
   UPDATE profiles
   SET entity_id = (SELECT id FROM foremen LIMIT 1)
   WHERE name = 'John Doe';
   ```

3. **Test Login:**
   - Email: `newuser@example.com`
   - Password: `TempPass123`
   - Expected: Logs in, sees dashboard ✅

---

## ✅ Summary

| Component | Status | Issue |
|-----------|--------|-------|
| Supabase Auth | ✅ Working | Users can login/signup |
| profiles table | ✅ Working | Created with trigger |
| user_roles table | ✅ Working | Roles assigned |
| entity_id linking | ❌ Missing | Always NULL |
| Organizational data | ✅ Tables exist | But empty or needs linking |
| **Result** | ❌ Dashboard empty | Missing entity_id |

**Fix:** Run the SQL script to add data and link users to organization.


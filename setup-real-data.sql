-- ============================================================================
-- Performance Evaluation System - Real Organization Data Setup
-- ============================================================================
-- This script sets up the actual organization structure with real names
-- ============================================================================

-- Step 1: Create Leaders
-- ============================================================================
INSERT INTO leaders (name)
VALUES ('Brian')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 2: Create Foremen (direct under leader, no managers)
-- ============================================================================
INSERT INTO foremen (name, manager_id)
VALUES
  ('Max', NULL),
  ('Dusty', NULL),
  ('Rana', NULL),
  ('Lucas', NULL),
  ('Daria', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 3: Create Workers (under each foreman)
-- ============================================================================

-- Workers under Max
INSERT INTO workers (name, foreman_id)
SELECT 'Josh', id FROM foremen WHERE name = 'Max'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Liam', id FROM foremen WHERE name = 'Max'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Nick W', id FROM foremen WHERE name = 'Max'
ON CONFLICT DO NOTHING;

-- Workers under Dusty
INSERT INTO workers (name, foreman_id)
SELECT 'Ashley', id FROM foremen WHERE name = 'Dusty'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Kayden', id FROM foremen WHERE name = 'Dusty'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Om', id FROM foremen WHERE name = 'Dusty'
ON CONFLICT DO NOTHING;

-- Workers under Rana
INSERT INTO workers (name, foreman_id)
SELECT 'Broaderik', id FROM foremen WHERE name = 'Rana'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Evan', id FROM foremen WHERE name = 'Rana'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'AJ', id FROM foremen WHERE name = 'Rana'
ON CONFLICT DO NOTHING;

-- Workers under Lucas
INSERT INTO workers (name, foreman_id)
SELECT 'Jack', id FROM foremen WHERE name = 'Lucas'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Ihor', id FROM foremen WHERE name = 'Lucas'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Nick M', id FROM foremen WHERE name = 'Lucas'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Elly', id FROM foremen WHERE name = 'Lucas'
ON CONFLICT DO NOTHING;

-- Workers under Daria
INSERT INTO workers (name, foreman_id)
SELECT 'Haley', id FROM foremen WHERE name = 'Daria'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Destini', id FROM foremen WHERE name = 'Daria'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 4: Update Dylan user to be foreman (Trevor - linking to Dylan)
-- ============================================================================
-- Note: You need to create a separate account for Dylan or Trevor
-- For now, we'll update the existing dylan user to link to an organization

UPDATE profiles
SET entity_id = (SELECT id FROM foremen WHERE name = 'Max' LIMIT 1)
WHERE name = 'dylan';

UPDATE user_roles
SET role = 'foreman'
WHERE user_id = (SELECT id FROM profiles WHERE name = 'dylan');

-- ============================================================================
-- Step 5: Create sample evaluations
-- ============================================================================
-- Add evaluations for workers (if needed)

-- ============================================================================
-- Step 6: Verification Queries
-- ============================================================================
-- Run these to verify the setup:

-- Check leaders
-- SELECT id, name FROM leaders;
-- Expected: 1 row (Brian)

-- Check foremen
-- SELECT id, name FROM foremen WHERE manager_id IS NULL;
-- Expected: 5 rows (Max, Dusty, Rana, Lucas, Daria)

-- Check workers count
-- SELECT COUNT(*) as total_workers FROM workers;
-- Expected: 15 workers

-- Check Dylan's setup
-- SELECT p.id, p.name, p.entity_id, ur.role, f.name as foreman_name
-- FROM profiles p
-- LEFT JOIN user_roles ur ON p.id = ur.user_id
-- LEFT JOIN foremen f ON p.entity_id = f.id
-- WHERE p.name = 'dylan';

-- ============================================================================
-- Summary
-- ============================================================================
-- Organization Structure Created:
--
-- Brian (Leader)
-- ├─ Max (Foreman) → [Josh, Liam, Nick W] (3 workers)
-- ├─ Dusty (Foreman) → [Ashley, Kayden, Om] (3 workers)
-- ├─ Rana (Foreman) → [Broaderik, Evan, AJ] (3 workers)
-- ├─ Lucas (Foreman) → [Jack, Ihor, Nick M, Elly] (4 workers)
-- └─ Daria (Foreman) → [Haley, Destini] (2 workers)
--
-- Total: 1 Leader, 5 Foremen, 15 Workers
--
-- Current User: dylan (linked to Max's team as foreman)
--
-- ============================================================================

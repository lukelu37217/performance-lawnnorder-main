-- ============================================================================
-- Performance Evaluation System - Test Data Setup Script
-- ============================================================================
-- Run this script in Supabase SQL Editor to set up complete test environment
-- ============================================================================

-- Step 1: Create Leaders
-- ============================================================================
INSERT INTO leaders (name)
VALUES ('Brian Davidson')
ON CONFLICT DO NOTHING;

-- Get the leader ID (save this)
-- SELECT id FROM leaders WHERE name = 'Brian Davidson';

-- ============================================================================
-- Step 2: Create Managers
-- ============================================================================
INSERT INTO managers (name, leader_id)
SELECT 'John Smith Manager', id FROM leaders WHERE name = 'Brian Davidson'
ON CONFLICT DO NOTHING;

INSERT INTO managers (name, leader_id)
SELECT 'Sarah Johnson Manager', id FROM leaders WHERE name = 'Brian Davidson'
ON CONFLICT DO NOTHING;

-- Get manager IDs:
-- SELECT id FROM managers WHERE name = 'John Smith Manager';
-- SELECT id FROM managers WHERE name = 'Sarah Johnson Manager';

-- ============================================================================
-- Step 3: Create Foremen
-- ============================================================================
INSERT INTO foremen (name, manager_id)
SELECT 'Dylan Foreman', id FROM managers WHERE name = 'John Smith Manager'
ON CONFLICT DO NOTHING;

INSERT INTO foremen (name, manager_id)
SELECT 'Mike Thompson Foreman', id FROM managers WHERE name = 'Sarah Johnson Manager'
ON CONFLICT DO NOTHING;

-- Also create a foreman directly under the leader (no manager)
INSERT INTO foremen (name, manager_id)
SELECT 'David Martinez Foreman', NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 4: Create Workers
-- ============================================================================
INSERT INTO workers (name, foreman_id)
SELECT 'Worker One', id FROM foremen WHERE name = 'Dylan Foreman'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Worker Two', id FROM foremen WHERE name = 'Dylan Foreman'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Worker Three', id FROM foremen WHERE name = 'Dylan Foreman'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Worker Four', id FROM foremen WHERE name = 'Mike Thompson Foreman'
ON CONFLICT DO NOTHING;

INSERT INTO workers (name, foreman_id)
SELECT 'Worker Five', id FROM foremen WHERE name = 'Mike Thompson Foreman'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 5: Create Sample Evaluations
-- ============================================================================
-- This creates evaluations for workers by the foreman

-- First, get the Dylan auth user ID (created via Supabase Auth signup)
-- The UUID is: 072fd764-7440-4793-af6e-c364e590a159 (from your screenshots)

-- Insert evaluations for Worker One (evaluated by Dylan Foreman)
INSERT INTO evaluations
(evaluator_id, evaluator_role, evaluatee_type, worker_id, foreman_id,
 evaluation_date, period, scores, total_score, rating, biweekly_period)
SELECT
  '072fd764-7440-4793-af6e-c364e590a159'::uuid,
  'foreman',
  'worker',
  w.id,
  f.id,
  NOW(),
  'biweekly',
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
  47
FROM workers w
JOIN foremen f ON w.foreman_id = f.id
WHERE w.name = 'Worker One' AND f.name = 'Dylan Foreman'
ON CONFLICT DO NOTHING;

-- Insert evaluations for Worker Two
INSERT INTO evaluations
(evaluator_id, evaluator_role, evaluatee_type, worker_id, foreman_id,
 evaluation_date, period, scores, total_score, rating, biweekly_period)
SELECT
  '072fd764-7440-4793-af6e-c364e590a159'::uuid,
  'foreman',
  'worker',
  w.id,
  f.id,
  NOW() - INTERVAL '2 days',
  'biweekly',
  '{
    "projectCompletion": 8,
    "qualityIssues": 7,
    "toolCare": 8,
    "equipmentEtiquette": 7,
    "nearMiss": 8,
    "incident": 9,
    "attendance": 8,
    "attitude": 8,
    "taskOwnership": 7,
    "customerInteraction": 8,
    "teamwork": 9
  }'::jsonb,
  89,
  'B',
  47
FROM workers w
JOIN foremen f ON w.foreman_id = f.id
WHERE w.name = 'Worker Two' AND f.name = 'Dylan Foreman'
ON CONFLICT DO NOTHING;

-- Insert evaluations for Worker Three
INSERT INTO evaluations
(evaluator_id, evaluator_role, evaluatee_type, worker_id, foreman_id,
 evaluation_date, period, scores, total_score, rating, biweekly_period)
SELECT
  '072fd764-7440-4793-af6e-c364e590a159'::uuid,
  'foreman',
  'worker',
  w.id,
  f.id,
  NOW() - INTERVAL '5 days',
  'biweekly',
  '{
    "projectCompletion": 7,
    "qualityIssues": 6,
    "toolCare": 7,
    "equipmentEtiquette": 6,
    "nearMiss": 6,
    "incident": 8,
    "attendance": 7,
    "attitude": 7,
    "taskOwnership": 6,
    "customerInteraction": 7,
    "teamwork": 7
  }'::jsonb,
  80,
  'B',
  47
FROM workers w
JOIN foremen f ON w.foreman_id = f.id
WHERE w.name = 'Worker Three' AND f.name = 'Dylan Foreman'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 6: Update profiles and user_roles for Dylan
-- ============================================================================
-- Link the dylan profile to the Dylan Foreman entity

UPDATE profiles
SET entity_id = (SELECT id FROM foremen WHERE name = 'Dylan Foreman')
WHERE name = 'dylan'
ON CONFLICT (id) DO UPDATE SET
  entity_id = EXCLUDED.entity_id;

-- Set Dylan as a foreman
UPDATE user_roles
SET role = 'foreman'
WHERE user_id = (SELECT id FROM profiles WHERE name = 'dylan')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role;

-- ============================================================================
-- Step 7: Verification Queries
-- ============================================================================
-- Run these to verify the setup:

-- Check leaders
-- SELECT id, name FROM leaders;

-- Check managers
-- SELECT id, name, leader_id FROM managers;

-- Check foremen
-- SELECT id, name, manager_id FROM foremen;

-- Check workers
-- SELECT id, name, foreman_id FROM workers;

-- Check Dylan's profile
-- SELECT id, name, entity_id FROM profiles WHERE name = 'dylan';

-- Check Dylan's role
-- SELECT user_id, role FROM user_roles
-- WHERE user_id = (SELECT id FROM profiles WHERE name = 'dylan');

-- Check evaluations
-- SELECT COUNT(*) as evaluation_count FROM evaluations;

-- ============================================================================
-- Summary
-- ============================================================================
-- You now have:
-- - 1 Leader (Brian Davidson)
-- - 2 Managers (under Brian)
-- - 3 Foremen (2 under managers, 1 independent)
-- - 5 Workers (distributed under foremen)
-- - 3 Sample Evaluations
-- - Dylan user linked to Dylan Foreman with foreman role

-- Test login: dylan@lawnorder.ca / dylan1234
-- You should now see the organizational hierarchy and evaluations

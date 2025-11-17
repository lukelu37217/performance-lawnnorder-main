-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Enable all operations for users" ON public.users;
DROP POLICY IF EXISTS "Enable all operations for leaders" ON public.leaders;
DROP POLICY IF EXISTS "Enable all operations for managers" ON public.managers;
DROP POLICY IF EXISTS "Enable all operations for foremen" ON public.foremen;
DROP POLICY IF EXISTS "Enable all operations for workers" ON public.workers;
DROP POLICY IF EXISTS "Enable all operations for evaluations" ON public.evaluations;

-- Create secure RLS policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin' 
    AND is_active = true
  )
);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can update all users" 
ON public.users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin' 
    AND is_active = true
  )
);

CREATE POLICY "Admins can insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin' 
    AND is_active = true
  )
);

CREATE POLICY "Admins can delete users" 
ON public.users 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id::text = auth.uid()::text 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- Create function to check user role for hierarchical access
CREATE OR REPLACE FUNCTION public.get_user_role(user_id text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id::text = user_id AND is_active = true;
$$;

-- Create function to check if user can manage entity
CREATE OR REPLACE FUNCTION public.can_manage_entity(user_id text, entity_type text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN get_user_role(user_id) = 'admin' THEN true
    WHEN get_user_role(user_id) = 'leader' AND entity_type IN ('manager', 'foreman', 'worker') THEN true
    WHEN get_user_role(user_id) = 'manager' AND entity_type IN ('foreman', 'worker') THEN true
    WHEN get_user_role(user_id) = 'foreman' AND entity_type = 'worker' THEN true
    ELSE false
  END;
$$;

-- Secure RLS policies for leaders
CREATE POLICY "Leaders can be viewed by authorized users" 
ON public.leaders 
FOR SELECT 
USING (can_manage_entity(auth.uid()::text, 'leader'));

CREATE POLICY "Admins can manage leaders" 
ON public.leaders 
FOR ALL 
USING (get_user_role(auth.uid()::text) = 'admin');

-- Secure RLS policies for managers
CREATE POLICY "Managers can be viewed by authorized users" 
ON public.managers 
FOR SELECT 
USING (can_manage_entity(auth.uid()::text, 'manager'));

CREATE POLICY "Leaders and admins can manage managers" 
ON public.managers 
FOR ALL 
USING (get_user_role(auth.uid()::text) IN ('admin', 'leader'));

-- Secure RLS policies for foremen
CREATE POLICY "Foremen can be viewed by authorized users" 
ON public.foremen 
FOR SELECT 
USING (can_manage_entity(auth.uid()::text, 'foreman'));

CREATE POLICY "Managers, leaders and admins can manage foremen" 
ON public.foremen 
FOR ALL 
USING (get_user_role(auth.uid()::text) IN ('admin', 'leader', 'manager'));

-- Secure RLS policies for workers
CREATE POLICY "Workers can be viewed by authorized users" 
ON public.workers 
FOR SELECT 
USING (can_manage_entity(auth.uid()::text, 'worker'));

CREATE POLICY "Foremen, managers, leaders and admins can manage workers" 
ON public.workers 
FOR ALL 
USING (get_user_role(auth.uid()::text) IN ('admin', 'leader', 'manager', 'foreman'));

-- Secure RLS policies for evaluations
CREATE POLICY "Users can view evaluations they created" 
ON public.evaluations 
FOR SELECT 
USING (evaluator_id::text = auth.uid()::text);

CREATE POLICY "Users can view evaluations for their subordinates" 
ON public.evaluations 
FOR SELECT 
USING (
  CASE 
    WHEN get_user_role(auth.uid()::text) = 'admin' THEN true
    WHEN get_user_role(auth.uid()::text) = 'leader' THEN true
    WHEN get_user_role(auth.uid()::text) = 'manager' THEN true
    WHEN get_user_role(auth.uid()::text) = 'foreman' THEN true
    ELSE false
  END
);

CREATE POLICY "Users can create evaluations for their role level" 
ON public.evaluations 
FOR INSERT 
WITH CHECK (
  evaluator_id::text = auth.uid()::text AND
  CASE 
    WHEN get_user_role(auth.uid()::text) = 'admin' THEN true
    WHEN get_user_role(auth.uid()::text) = 'leader' THEN true
    WHEN get_user_role(auth.uid()::text) = 'manager' THEN true
    WHEN get_user_role(auth.uid()::text) = 'foreman' THEN evaluatee_type = 'worker'
    ELSE false
  END
);

CREATE POLICY "Users can update their own evaluations" 
ON public.evaluations 
FOR UPDATE 
USING (evaluator_id::text = auth.uid()::text);

CREATE POLICY "Admins can delete evaluations" 
ON public.evaluations 
FOR DELETE 
USING (get_user_role(auth.uid()::text) = 'admin');

-- Update can_manage_reminders function to use proper search_path
DROP FUNCTION IF EXISTS public.can_manage_reminders(uuid);
CREATE OR REPLACE FUNCTION public.can_manage_reminders(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id 
    AND role IN ('admin', 'leader')
    AND is_active = true
  );
$$;
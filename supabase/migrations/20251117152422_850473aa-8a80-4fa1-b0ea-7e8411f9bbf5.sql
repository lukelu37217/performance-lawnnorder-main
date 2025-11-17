-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'leader', 'manager', 'foreman');

-- Create profiles table for user metadata
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create security definer function to get user role (returns first role)
CREATE OR REPLACE FUNCTION public.get_user_role_safe(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Remove the dangerous "allow all" policy from users table and add proper policies
DROP POLICY IF EXISTS "Temporary allow all for transition" ON public.users;

CREATE POLICY "Users can view their own user record"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Secure evaluations table
DROP POLICY IF EXISTS "Temporary allow all for evaluations" ON public.evaluations;

CREATE POLICY "Authenticated users can view evaluations"
  ON public.evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Leaders can manage all evaluations"
  ON public.evaluations FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Managers can create evaluations"
  ON public.evaluations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'leader'));

CREATE POLICY "Foremen can create worker evaluations"
  ON public.evaluations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'foreman') AND evaluatee_type = 'worker');

-- Secure organizational tables
DROP POLICY IF EXISTS "Temporary allow all for workers" ON public.workers;
DROP POLICY IF EXISTS "Temporary allow all for foremen" ON public.foremen;
DROP POLICY IF EXISTS "Temporary allow all for managers" ON public.managers;
DROP POLICY IF EXISTS "Temporary allow all for leaders" ON public.leaders;

CREATE POLICY "Authenticated users can view workers"
  ON public.workers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Foremen and above can manage workers"
  ON public.workers FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'leader') OR
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'foreman')
  );

CREATE POLICY "Authenticated users can view foremen"
  ON public.foremen FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and above can manage foremen"
  ON public.foremen FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'leader') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Authenticated users can view managers"
  ON public.managers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Leaders and admins can manage managers"
  ON public.managers FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'leader')
  );

CREATE POLICY "Authenticated users can view leaders"
  ON public.leaders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage leaders"
  ON public.leaders FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Note: Password column will be removed from users table after migration to Supabase Auth
-- For now, we've secured it with proper RLS policies
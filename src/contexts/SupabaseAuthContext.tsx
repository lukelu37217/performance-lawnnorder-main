import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'leader' | 'manager' | 'foreman';

interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  entityId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (action: string, targetRole?: string) => boolean;
  refreshUsers: () => void;
}

const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, entity_id')
      .eq('id', userId)
      .single();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    return {
      name: profile?.name || '',
      entityId: profile?.entity_id || null,
      role: (roleData?.role || 'foreman') as UserRole,
    };
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id).then(profile => {
              setUser({
                id: session.user.id,
                ...profile,
              });
            });
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        loadUserProfile(session.user.id).then(profile => {
          setUser({
            id: session.user.id,
            ...profile,
          });
        });
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error('Invalid email or password') : null };
    } catch (err) {
      return { error: new Error('Authentication failed. Please try again.') };
    }
  };

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
        return { error: new Error('Sign up failed. Email may already be in use.') };
      }

      // Wait for profile to be created by trigger, then set default foreman role
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'foreman' });
      }

      return { error: null };
    } catch (err) {
      return { error: new Error('Sign up failed. Please try again.') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const hasPermission = (action: string, targetRole?: string): boolean => {
    if (!user) return false;

    switch (user.role) {
      case 'admin':
        return true;
      case 'leader':
        return action === 'evaluate_foreman' || action === 'evaluate_worker' || action === 'view_all';
      case 'manager':
        return action === 'evaluate_foreman' || action === 'evaluate_worker' || action === 'view_team';
      case 'foreman':
        return action === 'evaluate_worker' || action === 'view_own_team';
      default:
        return false;
    }
  };

  const refreshUsers = () => {
    // Placeholder for compatibility - not needed with Supabase
  };

  const isAuthenticated = user !== null;

  return (
    <SupabaseAuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      isLoading,
      isAuthenticated,
      hasPermission,
      refreshUsers,
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
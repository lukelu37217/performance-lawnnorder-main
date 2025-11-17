import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, User } from '@/types';
import { dbService } from '@/services/database';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (action: string, targetRole?: string) => boolean;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Function to refresh users from database
  const refreshUsers = async () => {
    try {
      const dbUsers = await dbService.getUsers();
      setUsers(dbUsers);
    } catch (error) {
      setUsers([]);
    }
  };

  useEffect(() => {
    // Initial load of users from database
    refreshUsers();

    // Check for saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Normalize email to lowercase for consistent matching
      const normalizedEmail = email.toLowerCase();
      
      // Use the new findUserByEmail method for case-insensitive lookup
      const foundUser = await dbService.findUserByEmail(normalizedEmail);
      
      if (!foundUser) {
        return { success: false, error: 'No account found with this email address.' };
      }
      
      if (foundUser.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      // Special handling for admin users - they should always be able to login
      const isAdmin = foundUser.role === 'admin';
      
      if (!isAdmin) {
        // Check user status for approval (only for non-admin users)
        if (foundUser.status === 'pending') {
          return { success: false, error: 'Your account is awaiting admin approval.' };
        }

        if (foundUser.status === 'disabled') {
          return { success: false, error: 'Your account has been disabled. Please contact an administrator.' };
        }

        if (!foundUser.isActive) {
          return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
        }
      } else {
        // For admin users, ensure they are properly activated in the database
        if (foundUser.status !== 'approved' || !foundUser.isActive) {
          await dbService.updateUser(foundUser.id, {
            status: 'approved',
            isActive: true,
            isPending: false
          });
        }
      }

      // If user doesn't have an entityId, try to link them to existing entities
      if (!foundUser.entityId && !isAdmin) {
        const linkResult = await dbService.linkUserToExistingEntity(
          foundUser.id, 
          foundUser.email, 
          foundUser.name
        );
        
        if (linkResult.entityId) {
          // Refresh user data after linking
          const updatedUser = await dbService.findUserByEmail(normalizedEmail);
          if (updatedUser) {
            foundUser.entityId = updatedUser.entityId;
            foundUser.role = updatedUser.role;
            foundUser.isActive = updatedUser.isActive;
            foundUser.status = updatedUser.status;
          }
        }
      }

      const authUser: AuthUser = {
        id: foundUser.id,
        name: foundUser.name,
        role: foundUser.role,
        entityId: foundUser.entityId
      };
      
      // Login successful
      setUser(authUser);
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Database connection error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (action: string, targetRole?: string): boolean => {
    if (!user) return false;

    switch (user.role) {
      case 'admin':
        return true; // Admin has all permissions

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

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      hasPermission,
      refreshUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: { firstName?: string; lastName?: string; avatarUrl?: string }) => Promise<{ error: any }>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = apiClient.getToken();
    if (token) {
      // Verify token and get user data
      apiClient.getMe()
        .then((response) => {
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear it
            apiClient.clearToken();
          }
        })
        .catch(() => {
          // Token is invalid, clear it
          apiClient.clearToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: { message: 'Login failed' } };
      }
    } catch (error: any) {
      return { error: { message: error.message || 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await apiClient.register({ email, password, firstName, lastName });
      if (response.success) {
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: { message: 'Registration failed' } };
      }
    } catch (error: any) {
      return { error: { message: error.message || 'Registration failed' } };
    }
  };

  const signOut = async () => {
    apiClient.clearToken();
    setUser(null);
  };

  const updateProfile = async (profileData: { firstName?: string; lastName?: string; avatarUrl?: string }) => {
    try {
      const response = await apiClient.updateProfile(profileData);
      if (response.success) {
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: { message: 'Profile update failed' } };
      }
    } catch (error: any) {
      return { error: { message: error.message || 'Profile update failed' } };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
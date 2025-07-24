import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'parent' | 'provider') => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  setUserLocation: (location: User['location']) => void;
  logout: () => void;
  isLoading: boolean;
  supabaseUser: SupabaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        loadUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Try to load from providers table first
      const { data: provider } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (provider) {
        setUser({
          _id: userId,
          name: provider.owner_name,
          email: provider.email,
          phone: provider.phone,
          role: 'provider',
          businessName: provider.business_name,
          whatsapp: provider.whatsapp || undefined,
          website: provider.website || undefined,
          isVerified: provider.is_verified,
          location: {
            city: provider.city,
            area: provider.area,
            pincode: provider.pincode,
            coordinates: provider.latitude && provider.longitude ? {
              lat: provider.latitude,
              lng: provider.longitude
            } : undefined
          }
        });
        return;
      }

      // If not a provider, create a basic parent user
      const { data: supabaseUser } = await supabase.auth.getUser();
      if (supabaseUser.user) {
        setUser({
          _id: userId,
          name: supabaseUser.user.user_metadata?.name || 'User',
          email: supabaseUser.user.email || '',
          role: 'parent',
          children: []
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string, role: 'parent' | 'provider' = 'parent') => {
    if (!isSupabaseConfigured) {
      // Mock successful login for demo purposes when Supabase is not configured
      const mockUser: User = {
        _id: 'demo-user-' + Date.now(),
        name: 'Demo User',
        email: email,
        role: role,
        children: role === 'parent' ? [
          { name: 'Emma', age: 8, interests: ['music', 'art'] },
          { name: 'Liam', age: 10, interests: ['coding', 'sports'] }
        ] : undefined
      };
      setUser(mockUser);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // The user profile will be loaded automatically via the auth state change listener
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    if (!isSupabaseConfigured) {
      // Mock successful signup for demo purposes when Supabase is not configured
      const mockUser: User = {
        _id: 'demo-user-' + Date.now(),
        name: userData.name || 'Demo User',
        email: email,
        role: userData.role || 'parent',
        children: userData.role === 'parent' ? [
          { name: 'Emma', age: 8, interests: ['music', 'art'] },
          { name: 'Liam', age: 10, interests: ['coding', 'sports'] }
        ] : undefined
      };
      setUser(mockUser);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'parent'
        }
      }
    });

    if (error) throw error;

    // For providers, we'll create the provider record during onboarding
    // For parents, the user profile will be created automatically
  };

  const signInWithPhone = async (phone: string) => {
    if (!isSupabaseConfigured) {
      // Mock OTP sent for demo purposes when Supabase is not configured
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        data: {
          role: 'parent'
        }
      }
    });

    if (error) throw error;
  };

  const verifyOtp = async (phone: string, otp: string) => {
    if (!isSupabaseConfigured) {
      // Mock successful OTP verification for demo purposes when Supabase is not configured
      const mockUser: User = {
        _id: 'demo-user-' + Date.now(),
        name: 'Demo User',
        email: '',
        phone: phone,
        role: 'parent',
        children: [
          { name: 'Emma', age: 8, interests: ['music', 'art'] },
          { name: 'Liam', age: 10, interests: ['coding', 'sports'] }
        ]
      };
      setUser(mockUser);
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    });

    if (error) throw error;

    // The user profile will be loaded automatically via the auth state change listener
  };

  const setUserLocation = (location: User['location']) => {
    if (user) {
      const updatedUser = { ...user, location };
      setUser(updatedUser);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser,
      login, 
      signUp,
      signInWithPhone,
      verifyOtp,
      setUserLocation, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const { error } = await supabase.auth.signUp({
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
  };

  const signInWithPhone = async (phone: string) => {
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
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    });

    if (error) throw error;
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
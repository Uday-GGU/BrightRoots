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
    // Check if we're using placeholder Supabase credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseKey === 'placeholder-key' ||
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      // Mock authentication for development
      console.log('Using mock authentication for development');
      
      // Create mock user
      const mockUser = {
        _id: 'mock-user-id',
        name: email.split('@')[0],
        email: email,
        role: role,
        phone: role === 'provider' ? '+91 98765 43210' : undefined,
        businessName: role === 'provider' ? 'Mock Business' : undefined,
        isVerified: role === 'provider' ? false : undefined,
        location: role === 'parent' ? undefined : {
          city: 'Gurgaon',
          area: 'Sector 15',
          pincode: '122001'
        },
        children: role === 'parent' ? [
          { name: 'Child 1', age: 8, interests: ['music'] },
          { name: 'Child 2', age: 12, interests: ['sports'] }
        ] : undefined
      };
      
      setUser(mockUser);
      setSupabaseUser({
        id: 'mock-user-id',
        email: email,
        user_metadata: { name: mockUser.name, role: role }
      } as any);
      
      return;
    }
    
    // Real Supabase authentication
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      console.error('Supabase authentication error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    // Check if we're using placeholder Supabase credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseKey === 'placeholder-key' ||
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      // Mock sign up for development
      console.log('Using mock sign up for development');
      
      // Simulate successful signup
      const mockUser = {
        _id: 'mock-user-id',
        name: userData.name || email.split('@')[0],
        email: email,
        role: userData.role || 'parent',
        phone: userData.role === 'provider' ? '+91 98765 43210' : undefined,
        businessName: userData.role === 'provider' ? 'New Business' : undefined,
        isVerified: false,
        children: userData.role === 'parent' ? [] : undefined
      };
      
      setUser(mockUser);
      setSupabaseUser({
        id: 'mock-user-id',
        email: email,
        user_metadata: { name: mockUser.name, role: userData.role }
      } as any);
      
      return;
    }
    
    // Real Supabase sign up
    try {
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
    } catch (error) {
      console.error('Supabase sign up error:', error);
      throw error;
    }
  };

  const signInWithPhone = async (phone: string) => {
    // Check if we're using placeholder Supabase credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseKey === 'placeholder-key' ||
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      // Mock phone authentication for development
      console.log('Mock OTP sent to:', phone);
      return;
    }
    
    // Real Supabase phone authentication
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          data: {
            role: 'parent'
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Supabase phone auth error:', error);
      throw error;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    // Check if we're using placeholder Supabase credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseKey === 'placeholder-key' ||
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      // Mock OTP verification for development
      console.log('Mock OTP verification for:', phone, 'with OTP:', otp);
      
      // Accept any 6-digit OTP for development
      if (otp.length === 6) {
        const mockUser = {
          _id: 'mock-user-id',
          name: 'Parent User',
          email: '',
          phone: phone,
          role: 'parent' as const,
          children: [
            { name: 'Child 1', age: 8, interests: ['music'] },
            { name: 'Child 2', age: 12, interests: ['sports'] }
          ]
        };
        
        setUser(mockUser);
        setSupabaseUser({
          id: 'mock-user-id',
          phone: phone,
          user_metadata: { name: mockUser.name, role: 'parent' }
        } as any);
        
        return;
      } else {
        throw new Error('Invalid OTP. Please enter a 6-digit code.');
      }
    }
    
    // Real Supabase OTP verification
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;
    } catch (error) {
      console.error('Supabase OTP verification error:', error);
      throw error;
    }
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
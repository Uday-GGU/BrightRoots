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
    // Check for demo user first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      try {
        const userData = JSON.parse(demoUser);
        setUser(userData);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing demo user:', error);
        localStorage.removeItem('demoUser');
      }
    }
    
    // Handle email confirmation redirects
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session && window.location.hash.includes('access_token')) {
        // User just confirmed email, redirect appropriately
        const user = data.session.user;
        const isProvider = user.user_metadata?.role === 'provider';
        
        if (isProvider) {
          window.location.href = '/provider/onboarding';
        } else {
          window.location.href = '/location';
        }
        return;
      }
    };

    handleAuthRedirect();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
       console.log('🔄 Auth state change:', event, session?.user?.id);
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
    setIsLoading(true);
    try {
      console.log('🔍 Loading user profile for userId:', userId);
      
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('❌ Supabase environment variables not configured');
        throw new Error('Supabase configuration missing');
      }

      console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 Supabase Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      // Try to load from providers table first
      console.log('📊 Querying providers table...');
      
      let provider = null;
      let providerError = null;
      
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        provider = data;
        providerError = error;
      } catch (err) {
        console.log('⚠️ Provider query failed:', err);
        providerError = err;
      }

      console.log('📊 Provider query result:', { provider, providerError });

      // Check if provider exists and no critical error
      if (provider && !providerError) {
        console.log('✅ Provider found, creating provider user:', provider);
        setUser({
          _id: userId,
          id: userId,
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
        console.log('✅ Provider user created successfully');
        console.log('🏁 Profile loading completed for provider');
       setIsLoading(false);
        return;
      }
      
      // Handle PGRST116 (no rows found) or other non-critical errors
      if (providerError && providerError.code === 'PGRST116') {
        console.log('📝 PGRST116 error (no provider found) - this is expected for parent users');
      } else if (providerError) {
        console.log('⚠️ Provider query error (non-critical):', providerError);
      }
      
      console.log('👤 No provider found, creating parent user');
      // If not a provider, create a basic parent user
      
      let supabaseUserData = null;
      let userError = null;
      
      try {
        console.log('🔍 Getting Supabase user data...');
        const { data, error } = await supabase.auth.getUser();
        supabaseUserData = data;
        userError = error;
      } catch (err) {
        console.log('⚠️ Getting user data failed:', err);
        userError = err;
      }
      
      console.log('📋 Supabase user data:', supabaseUserData);
      
      if (userError) {
        console.error('❌ Error getting Supabase user:', userError);
        // Don't throw, create fallback user instead
        console.log('🔄 Creating fallback user due to user data error');
      }
      
      if (supabaseUserData?.user) {
        const userRole = supabaseUserData.user.user_metadata?.role || 'parent';
        console.log('🎭 Determined user role:', userRole);
        
        const newUser = {
          _id: userId,
          id: userId,
          name: supabaseUserData.user.user_metadata?.name || 'User',
          email: supabaseUserData.user.email || '',
          role: userRole,
          children: []
        };
        
        console.log('👤 Creating user object:', newUser);
        setUser(newUser);
        console.log('✅ Parent/basic user created successfully');
      } else {
        console.log('⚠️ No Supabase user found, creating minimal user');
        // Create minimal user instead of throwing error
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      
      // Create a minimal fallback user to prevent hanging
      console.log('🔄 Creating minimal fallback user due to error');
      try {
        const { data: fallbackUser, error: fallbackError } = await supabase.auth.getUser();
        if (fallbackUser?.user && !fallbackError) {
          const userRole = fallbackUser.user.user_metadata?.role || 'parent';
          console.log('🔄 Creating fallback user with role:', userRole);
          setUser({
            _id: userId,
            id: userId,
            name: fallbackUser.user.user_metadata?.name || 'User',
            email: fallbackUser.user.email || '',
            role: userRole,
            children: []
          });
          console.log('✅ Fallback user created successfully');
        } else {
          console.log('⚠️ Could not create fallback user - no auth data, creating minimal user');
          // Set a minimal user to prevent hanging
          setUser({
            _id: userId,
            id: userId,
            name: 'User',
            email: '',
            role: 'parent',
            children: []
          });
          console.log('⚠️ Created minimal user to prevent hanging');
        }
      } catch (fallbackError) {
        console.log('⚠️ Fallback user creation failed:', fallbackError);
        // Last resort - create minimal user
        setUser({
          _id: userId,
          id: userId,
          name: 'User',
          email: '',
          role: 'parent',
          children: []
        });
        console.log('🆘 Created emergency minimal user');
      }
    } finally {
      console.log('🏁 Profile loading completed, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'parent' | 'provider' = 'parent') => {
    console.log('🚀 Starting login process for:', email, 'with role:', role);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
    
    console.log('✅ Login successful, auth data:', data);
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
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
    const { data, error } = await supabase.auth.verifyOtp({
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
    // Clear demo user
    localStorage.removeItem('demoUser');
    setUser(null);
    
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
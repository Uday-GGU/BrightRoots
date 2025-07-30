import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProviderService } from '../services/providerService';
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


      // Get Supabase user data first
      const { data: supabaseUserData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        // Handle invalid refresh token errors
        if (userError.message?.includes('Invalid Refresh Token') || 
            userError.message?.includes('Refresh Token Not Found') ||
            userError.message?.includes('Auth session missing')) {
          await logout();
          return;
        }
        
        throw userError;
      }
      
      if (!supabaseUserData?.user) {
        throw new Error('No user data found');
      }
      
      const userRole = supabaseUserData.user.user_metadata?.role || 'parent';
      
      // Only query providers table if user is actually a provider
      if (userRole === 'provider') {
        try {
          const provider = await ProviderService.getProviderByUserId(userId);
          
          if (provider) {
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
            return;
          } else {
            // For providers without profile, we'll let the routing handle the redirect
          }
        } catch (err) {
          // Continue to create basic user instead of failing
        }
      }
      
      // Create parent user (or fallback user)
      
      // Create user profile in database for parent users
      if (userRole === 'parent') {
        try {
          // Check if profile already exists
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();
          
          if (profileCheckError && profileCheckError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: userId,
                name: supabaseUserData.user.user_metadata?.name || 'User',
                email: supabaseUserData.user.email || '',
                role: 'parent',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (createError) {
              // Silently handle profile creation errors
            } else {
              // Profile created successfully
            }
          } else if (!profileCheckError) {
            // Profile already exists
          }
        } catch (profileError) {
          // Silently handle profile errors
        }
      }
      
      const newUser = {
        _id: userId,
        id: userId,
        name: supabaseUserData.user.user_metadata?.name || 'User',
        email: supabaseUserData.user.email || '',
        role: userRole,
        children: []
      };
      
      setUser(newUser);
      
    } catch (error) {
      // Handle authentication errors by forcing logout
      if (error instanceof Error && 
          (error.message?.includes('Invalid Refresh Token') || 
           error.message?.includes('Refresh Token Not Found') ||
           error.message?.includes('Auth session missing'))) {
        await logout();
        return;
      }
      
      // Create minimal fallback user to prevent hanging
      try {
        const { data: fallbackUser, error: fallbackError } = await supabase.auth.getUser();
        if (fallbackUser?.user && !fallbackError) {
          const userRole = fallbackUser.user.user_metadata?.role || 'parent';
          setUser({
            _id: userId,
            id: userId,
            name: fallbackUser.user.user_metadata?.name || 'User',
            email: fallbackUser.user.email || '',
            role: userRole,
            children: []
          });
        } else {
          // Last resort minimal user
          setUser({
            _id: userId,
            id: userId,
            name: 'User',
            email: '',
            role: 'parent',
            children: []
          });
        }
      } catch (fallbackError) {
        // Emergency minimal user
        setUser({
          _id: userId,
          id: userId,
          name: 'User',
          email: '',
          role: 'parent',
          children: []
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'parent' | 'provider' = 'parent') => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    
    // Force immediate profile loading and navigation
    if (data.user) {
      await loadUserProfile(data.user.id);
    }
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

    if (error) {
      throw error;
    }
    
    return data;
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
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    setUser(null);
    
    if (supabase) {
      await supabase.auth.signOut();
    }
    
    // Redirect to main login page
    window.location.href = '/';
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
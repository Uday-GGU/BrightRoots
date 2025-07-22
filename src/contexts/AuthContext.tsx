import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (method: 'google' | 'phone', identifier: string, role?: 'parent' | 'provider') => Promise<void>;
  setUserLocation: (location: User['location']) => void;
  logout: () => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('eduverse-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (method: 'google' | 'phone', identifier: string, role: 'parent' | 'provider' = 'parent') => {
    // Mock authentication
    const mockUser: User = {
      _id: Math.random().toString(36).substr(2, 9),
      name: role === 'provider' ? 'John Smith' : 'Sarah Johnson',
      email: method === 'google' ? identifier : undefined,
      phone: method === 'phone' ? identifier : undefined,
      role,
      children: role === 'parent' ? [
        { name: 'Emma', age: 8, interests: ['music', 'coding'] },
        { name: 'Liam', age: 10, interests: ['sports', 'math'] }
      ] : undefined,
      wishlist: []
    };
    
    localStorage.setItem('eduverse-user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const setUserLocation = (location: User['location']) => {
    if (user) {
      const updatedUser = { ...user, location };
      setUser(updatedUser);
      localStorage.setItem('eduverse-user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('eduverse-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, setUserLocation, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
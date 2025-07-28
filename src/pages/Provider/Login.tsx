import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

export default function ProviderLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Redirect if already logged in as provider
  useEffect(() => {
    if (user?.role === 'provider') {
      navigate('/provider/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError('Missing Information', 'Please fill all fields');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Starting provider login...');

      // Demo provider login check
      if (formData.email === 'provider@demo.com' && formData.password === 'provider123') {
        localStorage.setItem('demoUser', JSON.stringify({
          _id: 'demo-provider-1',
          id: 'demo-provider-1',
          name: 'Demo Provider',
          email: 'provider@demo.com',
          role: 'provider',
          businessName: 'Demo Music Academy',
          phone: '+91 98765 43210',
          isVerified: true,
          location: {
            city: 'Gurgaon',
            area: 'Sector 15',
            pincode: '122001',
            coordinates: { lat: 28.4595, lng: 77.0266 }
          }
        }));
        
        showSuccess('Login Successful', 'Welcome to BrightRoots Provider Dashboard!');
        setTimeout(() => {
          window.location.href = '/provider/dashboard';
        }, 1000);
        return;
      }

      // Regular Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Login failed - no user data received');
      }

      console.log('✅ Provider login successful');
      
      // Check if user has provider role
      const userRole = data.user.user_metadata?.role;
      if (userRole !== 'provider') {
        await supabase.auth.signOut();
        throw new Error('This account is not registered as a provider. Please use the parent login or create a provider account.');
      }

      // Navigation will be handled by AuthContext
      console.log('🔄 Login completed, waiting for auth context to handle navigation');

    } catch (error: any) {
      console.error('❌ Provider login error:', error);
      setIsLoading(false);
      
      // Ensure error is properly handled for toast notifications
      const errorMessage = error?.message || error?.error_description || 'An unexpected error occurred';
      
      if (errorMessage.includes('Invalid login credentials')) {
        showError('Login Failed', 'Invalid email or password. Please check your credentials.');
      } else if (errorMessage.includes('Email not confirmed')) {
        showError('Email Not Confirmed', 'Please check your email and click the confirmation link before logging in.');
      } else if (errorMessage.includes('not registered as a provider')) {
        showError('Account Type Error', error.message);
      } else if (errorMessage.includes('Failed to fetch')) {
        showError('Connection Error', 'Unable to connect to the server. Please check your internet connection.');
      } else {
        showError('Login Failed', errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Login
          </h1>
          <p className="text-gray-600">Welcome back to BrightRoots</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full group"
              disabled={isLoading}
            >
              <span>
                {isLoading ? 'Logging in...' : 'Login to Dashboard'}
              </span>
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/provider/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/provider/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Email:</strong> provider@demo.com</p>
                <p><strong>Password:</strong> provider123</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-800 text-sm">
            ← Back to Main App
          </Link>
        </div>
      </div>
    </div>
  );
}
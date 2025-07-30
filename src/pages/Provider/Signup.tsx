import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

export default function ProviderSignup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
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
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      showError('Missing Information', 'Please fill all fields');
      return;
    }

    if (formData.password.length < 6) {
      showError('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Starting provider signup process...');

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'provider'
          }
        }
      });

      if (authError) {
        throw new Error(`Signup failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log('✅ Auth user created:', authData.user.id);


      showSuccess('Account Created', 'Please check your email to verify your account, then you can login.');
      
      // Clear form data
      setFormData({
        name: '',
        email: '',
        password: ''
      });
      
      navigate('/provider/login');

    } catch (error: any) {
      console.error('❌ Provider signup error:', error);
      
      if (error.message.includes('User already registered')) {
        showError('Account Already Exists', 'An account with this email already exists. Please use the login option instead.');
      } else if (error.message.includes('Invalid email')) {
        showError('Invalid Email', 'Please enter a valid email address.');
      } else {
        showError('Signup Failed', error.message || 'Account creation failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
            Join BrightRoots
          </h1>
          <p className="text-gray-600">Create your provider account</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
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
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>


            <Button 
              type="submit" 
              size="lg" 
              className="w-full group"
              disabled={isLoading}
            >
              <span>
                {isLoading ? 'Creating Account...' : 'Create Provider Account'}
              </span>
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/provider/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
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
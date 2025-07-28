import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Mail, Lock, User, Phone, DollarSign, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ProviderService } from '../../services/providerService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

const serviceCategories = [
  { id: 'tuition', name: 'Academic Tuitions', icon: '📚' },
  { id: 'music', name: 'Music Classes', icon: '🎵' },
  { id: 'dance', name: 'Dance Classes', icon: '💃' },
  { id: 'sports', name: 'Sports Training', icon: '⚽' },
  { id: 'coding', name: 'Coding / STEM', icon: '💻' },
  { id: 'art', name: 'Art & Craft', icon: '🎨' },
  { id: 'daycare', name: 'Daycare / After-school', icon: '🏠' },
  { id: 'camps', name: 'Summer Camps', icon: '🏕️' }
];

export default function ProviderSignup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: '',
    phone: '',
    fees: ''
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
    if (!formData.name || !formData.email || !formData.password || 
        !formData.category || !formData.phone || !formData.fees) {
      showError('Missing Information', 'Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      showError('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }

    if (isNaN(Number(formData.fees)) || Number(formData.fees) <= 0) {
      showError('Invalid Fee', 'Please enter a valid fee amount');
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

      // 2. Create provider record in providers table
      const providerData = {
        user_id: authData.user.id,
        business_name: `${formData.name}'s ${serviceCategories.find(c => c.id === formData.category)?.name || 'Classes'}`,
        owner_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        description: `Professional ${formData.category} services`,
        address: 'Location to be updated',
        city: 'To be updated',
        area: 'To be updated',
        pincode: '000000',
        status: 'pending' as const
      };

      const newProvider = await ProviderService.createProvider(providerData);
      console.log('✅ Provider record created:', newProvider.id);

      // 3. Add service category
      await ProviderService.addProviderServices(newProvider.id, [formData.category]);
      console.log('✅ Service category added');

      // 4. Create a sample class
      await ProviderService.createClass({
        provider_id: newProvider.id,
        name: `${serviceCategories.find(c => c.id === formData.category)?.name || 'Classes'}`,
        description: `Professional ${formData.category} training`,
        category: formData.category,
        age_group: '6-16 years',
        mode: 'offline',
        duration: '60 minutes',
        price: Number(formData.fees),
        fee_type: 'per_session'
      });
      console.log('✅ Sample class created');

      showSuccess('Account Created', 'Please check your email to verify your account, then you can login.');
      
      // Clear form data
      setFormData({
        name: '',
        email: '',
        password: '',
        category: '',
        phone: '',
        fees: ''
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

            {/* Category Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Category *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  required
                >
                  <option value="">Select your service category</option>
                  {serviceCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Fees Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fees (per session) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.fees}
                  onChange={(e) => handleInputChange('fees', e.target.value)}
                  placeholder="Enter fees amount"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  min="1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Amount in ₹ (Indian Rupees)
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
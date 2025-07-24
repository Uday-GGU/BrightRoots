import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';

export default function Login() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signUp, signInWithPhone, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Demo login credentials
    if (identifier === 'parent@demo.com' && password === 'parent123') {
      // Create demo parent user
      localStorage.setItem('demoUser', JSON.stringify({
        _id: 'demo-parent-1',
        id: 'demo-parent-1',
        name: 'Demo Parent',
        email: 'parent@demo.com',
        role: 'parent',
        location: {
          city: 'Gurgaon',
          area: 'Sector 15',
          pincode: '122001',
          coordinates: { lat: 28.4595, lng: 77.0266 }
        },
        children: [
          { name: 'Emma', age: 8, interests: ['music', 'art'] },
          { name: 'Liam', age: 10, interests: ['coding', 'sports'] }
        ]
      }));
      
      alert('Demo login successful! Redirecting to home...');
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
      return;
    }
    
    try {
      if (method === 'phone' && !showOtp) {
        // Send OTP
        await signInWithPhone(identifier);
        setShowOtp(true);
        return;
      }
      
      if (method === 'phone' && showOtp) {
        if (!otp || otp.length !== 6) {
          alert('Please enter a valid 6-digit OTP');
          return;
        }
        // Verify OTP
        await verifyOtp(identifier, otp);
        navigate('/location');
      } else if (method === 'email' && useMagicLink) {
        if (!identifier.trim()) {
          alert('Please enter your email address');
          return;
        }
        // Send magic link for email authentication
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            emailRedirectTo: `${window.location.origin}/home`
          }
        });
        
        if (error) throw error;
        
        alert('Check your email for the magic link!');
        return;
      } else if (method === 'email' && !useMagicLink) {
        if (!identifier.trim() || !password.trim()) {
          alert('Please enter both email and password');
          return;
        }
        
        if (isSignup && !name.trim()) {
          alert('Please enter your name');
          return;
        }
        
        if (isSignup) {
          await signUp(identifier, password, { name, role: 'parent' });
          alert('Account created! Please check your email to verify your account before logging in.');
        } else {
          await login(identifier, password, 'parent');
          navigate('/location');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        alert('Invalid email or password. Please check your credentials.');
      } else if (error.message.includes('Email not confirmed')) {
        alert('Please check your email and click the confirmation link before logging in.');
      } else if (error.message.includes('User already registered')) {
        alert('An account with this email already exists. Please login instead.');
      } else if (error.message.includes('Failed to fetch')) {
        alert('Unable to connect to the server. Please check your internet connection and Supabase configuration.');
      } else {
        alert(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to BrightRoots
          </h1>
          <p className="text-gray-600">Find the best classes for your child</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Method Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMethod('email');
                  setShowOtp(false);
                  setOtp('');
                  setPassword('');
                  setIsSignup(false);
                }}
                className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  method === 'email'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className="w-5 h-5 mr-2" />
                <span className="font-medium">Email</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setMethod('phone');
                  setShowOtp(false);
                  setOtp('');
                  setPassword('');
                }}
                className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  method === 'phone'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className="w-5 h-5 mr-2" />
                <span className="font-medium">Phone</span>
              </button>
            </div>

            {/* Name Field for Email Signup */}
            {method === 'email' && isSignup && !useMagicLink && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            )}

            {/* Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {method === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                {method === 'email' ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={method === 'email' ? 'Enter your email' : 'Enter your phone number'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  disabled={showOtp}
                />
              </div>
            </div>

            {/* Password Field for Email Login */}
            {method === 'email' && !useMagicLink && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "Create a password" : "Enter your password"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  minLength={6}
                />
                {isSignup && (
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
            )}

            {/* Magic Link Toggle for Email */}
            {method === 'email' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useMagicLink}
                    onChange={(e) => setUseMagicLink(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                  />
                  Use magic link instead
                </label>
                {!useMagicLink && (
                  <button
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    {isSignup ? 'Already have account?' : 'Need an account?'}
                  </button>
                )}
              </div>
            )}

            {/* OTP Field */}
            {method === 'phone' && showOtp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  OTP sent to {identifier}
                </p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full group">
              <span>
                {method === 'phone' && !showOtp ? 'Send OTP' : 
                 method === 'phone' && showOtp ? 'Verify OTP' : 
                 method === 'email' && useMagicLink ? 'Send Magic Link' :
                 method === 'email' && isSignup ? 'Create Account' : 
                 isLoading ? 'Logging in...' : 'Login'}
              </span>
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          {method === 'phone' && showOtp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtp('');
                }}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Change phone number
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Parent Login:</strong> parent@demo.com / parent123</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Button to="/provider/login" variant="outline" size="sm">
              Are you an educator? Join as Provider
            </Button>
          </div>
          
          <div className="mt-2 text-center">
            <Button to="/admin/login" variant="outline" size="sm">
              Admin Portal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
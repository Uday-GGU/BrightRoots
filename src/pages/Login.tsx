import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';

export default function Login() {
  const [method, setMethod] = useState<'google' | 'phone'>('google');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const { login, signInWithPhone, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      } else if (method === 'google') {
        if (!identifier.trim()) {
          alert('Please enter your email address');
          return;
        }
          alert('Password is required');
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
        
        alert('Check your email for the login link!');
        return;
      }
      
      // Only navigate for phone OTP verification
      if (method === 'phone') {
        navigate('/location');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        alert('Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
      } else if (error.message.includes('Email not confirmed')) {
        alert('Please check your email and click the confirmation link before logging in.');
      } else if (error.message.includes('Failed to fetch')) {
        alert('Unable to connect to the server. Please check your internet connection and Supabase configuration.');
      } else {
        alert(error.message || 'Login failed. Please try again.');
      }
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
                  setMethod('google');
                  setShowOtp(false);
                  setOtp('');
                }}
                className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  method === 'google'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className="w-5 h-5 mr-2" />
                <span className="font-medium">Google</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setMethod('phone');
                  setShowOtp(false);
                  setOtp('');
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

            {/* Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {method === 'google' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                {method === 'google' ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type={method === 'google' ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={method === 'google' ? 'Enter your email' : 'Enter your phone number'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  disabled={showOtp}
                />
              </div>
            </div>

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
                 'Continue with Google'}
              </span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Button to="/provider/login" variant="outline" size="sm">
              Are you an educator? Join as Provider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
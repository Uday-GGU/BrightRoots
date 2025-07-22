import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Phone, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';

export default function ProviderLogin() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (method === 'phone' && !showOtp) {
      setShowOtp(true);
      return;
    }
    
    if (method === 'phone' && (!otp || otp.length !== 6)) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (method === 'email' && !password.trim()) {
      alert('Please enter your password');
      return;
    }
    
    if (!identifier.trim()) return;
    
    await login(method === 'email' ? 'google' : 'phone', identifier, 'provider');
    navigate('/provider/onboarding');
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
            Join EduVerse
          </h1>
          <p className="text-gray-600">Start your journey as an education provider</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isSignup ? 'Create Provider Account' : 'Provider Login'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isSignup ? 'Join thousands of educators' : 'Welcome back!'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Method Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMethod('email');
                  setShowOtp(false);
                  setOtp('');
                }}
                className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  method === 'email'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                }}
                className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  method === 'phone'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={showOtp}
                />
              </div>
            </div>

            {/* Password Field for Email */}
            {method === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
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
                 isSignup ? 'Create Account' : 'Login'}
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
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Change phone number
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button to="/" variant="outline">
            Looking for classes? Switch to Parent App
          </Button>
        </div>
      </div>
    </div>
  );
}
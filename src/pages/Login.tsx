import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
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
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login, signUp, signInWithPhone, verifyOtp } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  const handleResendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail
      });
      
      if (error) throw error;
      
      showSuccess('Verification Email Sent', 'Please check your email (including spam folder) for the verification link.');
    } catch (error: any) {
      console.error('Resend verification error:', error);
      showError('Failed to Resend Email', error.message || 'Unable to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoginError(''); // Clear any previous error
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
      
      showSuccess('Login Successful', 'Welcome to BrightRoots! Redirecting to home...');
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
          showError('Invalid OTP', 'Please enter a valid 6-digit OTP');
          return;
        }
        // Verify OTP
        await verifyOtp(identifier, otp);
        navigate('/location');
      } else if (method === 'email' && useMagicLink) {
        if (!identifier.trim()) {
          showError('Missing Email', 'Please enter your email address');
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
        
        showInfo('Magic Link Sent', 'Check your email for the login link!');
        return;
      } else if (method === 'email' && !useMagicLink) {
        if (!identifier.trim() || !password.trim()) {
          showError('Missing Information', 'Please enter both email and password');
          return;
        }
        
        if (isSignup && !name.trim()) {
          showError('Missing Information', 'Please enter your name');
          return;
        }
        
        if (isSignup) {
          await signUp(identifier, password, { name, role: 'parent' });
          showSuccess('Account Created Successfully!', 'Please check your email to verify your account before logging in. You can close this page and return after verification.');
          setPendingEmail(identifier);
          setIsSignup(false); // Switch back to login mode
          setName(''); // Clear name field
          setPassword(''); // Clear password field
        } else {
          await login(identifier, password, 'parent');
          console.log('✅ Login completed, checking navigation...');
          // Don't navigate immediately - let AuthContext handle it
          // The useEffect in App.tsx will handle proper navigation based on user state
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      setIsLoading(false); // Always reset loading state on error
      
      // Ensure error is properly handled for toast notifications
      const errorMessage = error?.message || error?.error_description || 'An unexpected error occurred';
      
      if (error.message.includes('Invalid login credentials')) {
        showError('Login Failed', 'Invalid email or password. Please check your credentials.');
        setLoginError('Invalid email or password. Please check your credentials.');
      } else if (error.message.includes('Email not confirmed')) {
        showError('Email Not Confirmed', 'Please check your email (including spam folder) and click the confirmation link before logging in.');
        setShowResendEmail(true);
        setPendingEmail(identifier);
      } else if (error.message.includes('User already registered')) {
        showError('Account Already Exists', 'An account with this email already exists. Please use the login option instead.');
        setIsSignup(false); // Switch to login mode
      } else if (error.message.includes('Failed to fetch')) {
        showError('Connection Error', 'Unable to connect to the server. Please check your internet connection.');
      } else {
        showError(isSignup ? 'Signup Failed' : 'Login Failed', error.message || `${isSignup ? 'Account creation' : 'Login'} failed. Please try again.`);
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
            
            {/* Error message display */}
            {loginError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 text-center">{loginError}</p>
              </div>
            )}
            
            {/* Resend Verification Email */}
            {showResendEmail && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Email Not Verified</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Didn't receive the verification email?
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerificationEmail}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Resend Email'}
                  </Button>
                </div>
              </div>
            )}
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
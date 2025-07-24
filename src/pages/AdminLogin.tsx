import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      alert('Please fill all fields');
      return;
    }
    
    setIsLoading(true);
    
    // Demo credentials check
    if (username === 'admin' && password === 'admin123') {
      // Store admin session
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminUser', JSON.stringify({
        id: 'admin-1',
        username: 'admin',
        role: 'admin',
        name: 'System Administrator'
      }));
      
      navigate('/admin/dashboard');
    } else {
      alert('Invalid credentials. Use admin/admin123');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-400">BrightRoots Management System</p>
        </div>

        <Card className="p-8 bg-gray-800 border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Administrator Login
            </h2>
            <p className="text-gray-400 text-sm">
              Demo credentials: admin / admin123
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              disabled={isLoading}
            >
              <span>
                {isLoading ? 'Logging in...' : 'Login to Admin Panel'}
              </span>
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-2">Demo Credentials:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Button to="/" variant="outline" className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500">
            Back to Main App
          </Button>
        </div>
      </div>
    </div>
  );
}
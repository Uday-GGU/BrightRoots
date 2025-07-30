import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useToast } from './hooks/useToast';
import ToastContainer from './components/UI/ToastContainer';
import BottomNav from './components/Layout/BottomNav';
import Login from './pages/Login';
import LocationSetup from './pages/LocationSetup';
import Home from './pages/Home';
import ProviderDetails from './pages/ProviderDetails';
import Enquiries from './pages/Enquiries';
import ProviderOnboarding from './pages/Provider/Onboarding';
import ProviderDashboard from './pages/Provider/Dashboard';
import SimpleOnboarding from './pages/Provider/SimpleOnboarding';
import DebugLogin from './pages/DebugLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/Admin/Dashboard';
import AddProvider from './pages/Admin/AddProvider';
import ProviderLogin from './pages/Provider/Login';
import ProviderSignup from './pages/Provider/Signup';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function ProviderRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'provider') {
    return <Navigate to="/provider/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const adminAuth = localStorage.getItem('adminAuth');
  
  if (!adminAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const { toasts, removeToast } = useToast();
  const showBottomNav = user && user.role === 'parent' && !['/login', '/location', '/'].includes(window.location.pathname);

  // Handle automatic redirects based on user state
  React.useEffect(() => {
    if (!isLoading && user) {
      const currentPath = window.location.pathname;
      console.log('🎯 User loaded, checking redirect:', { user: user.role, currentPath });
      
      // Redirect providers to dashboard if they're on login page
      if (user.role === 'provider' && currentPath === '/provider/login') {
        console.log('🔄 Redirecting provider from login to dashboard');
        window.location.href = '/provider/dashboard';
        return;
      }
      
      // Redirect parents to location setup if they don't have location
      if (user.role === 'parent' && !user.location && (currentPath === '/' || currentPath === '/login')) {
        console.log('🔄 Redirecting parent to location setup');
        window.location.href = '/location';
        return;
      }
      
      // Redirect parents to home if they have location and are on root
      if (user.role === 'parent' && user.location && (currentPath === '/' || currentPath === '/login')) {
        console.log('🔄 Redirecting parent to home');
        window.location.href = '/home';
        return;
      }
    }
  }, [user, isLoading]);

  React.useEffect(() => {
    console.log('🎯 App state update - Current user:', user);
    console.log('🌐 Current pathname:', window.location.pathname);
    console.log('📱 Show bottom nav:', showBottomNav);
    
    // Debug navigation logic
    if (user) {
      console.log('👤 User found with role:', user.role);
      if (user.role === 'provider') {
        console.log('🏢 Provider user - should redirect to dashboard or onboarding');
      } else {
        console.log('👨‍👩‍👧‍👦 Parent user - should redirect to location or home');
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/provider/login" element={!user ? <ProviderLogin /> : <Navigate to="/provider/dashboard" />} />
        <Route path="/provider/signup" element={!user ? <ProviderSignup /> : <Navigate to="/provider/dashboard" />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/add-provider" element={
          <AdminRoute>
            <AddProvider />
          </AdminRoute>
        } />
        
        {/* Debug Route - Remove in production */}
        <Route path="/debug-login" element={<DebugLogin />} />
        
        {/* Location Setup */}
        <Route path="/location" element={
          <ProtectedRoute>
            <LocationSetup />
          </ProtectedRoute>
        } />

        {/* Main App Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/provider/:id" element={
          <ProtectedRoute>
            <ProviderDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/enquiries" element={
          <ProtectedRoute>
            <Enquiries />
          </ProtectedRoute>
        } />

        {/* Provider Routes */}
        <Route path="/provider/onboarding" element={
          <ProviderRoute>
            <ProviderOnboarding />
          </ProviderRoute>
        } />
        
        <Route path="/provider/dashboard" element={
          <ProviderRoute>
            <ProviderDashboard />
          </ProviderRoute>
        } />
        
        <Route path="/provider/setup" element={
          <ProviderRoute>
            <SimpleOnboarding />
          </ProviderRoute>
        } />
        
        {/* Catch-all for authenticated providers without profile */}
        <Route path="/provider/*" element={
          user?.role === 'provider' ? (
            <Navigate to="/provider/setup" replace />
          ) : (
            <Navigate to="/provider/login" replace />
          )
        } />
        
        {/* Placeholder routes */}
        <Route path="/search" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-16">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
                <p className="text-gray-600">Advanced search coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-16">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Wishlist</h1>
                <p className="text-gray-600">Your saved providers will appear here...</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-16">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
                <p className="text-gray-600">Profile settings coming soon...</p>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showBottomNav && <BottomNav />}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
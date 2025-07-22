import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BottomNav from './components/Layout/BottomNav';
import Login from './pages/Login';
import LocationSetup from './pages/LocationSetup';
import Home from './pages/Home';
import ProviderDetails from './pages/ProviderDetails';
import Enquiries from './pages/Enquiries';
import ProviderLogin from './pages/ProviderLogin';
import ProviderOnboarding from './pages/Provider/Onboarding';
import ProviderDashboard from './pages/Provider/Dashboard';

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

function AppContent() {
  const { user } = useAuth();
  const showBottomNav = user && user.role === 'parent' && !['/login', '/location', '/'].includes(window.location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route path="/provider/login" element={!user ? <ProviderLogin /> : <Navigate to="/provider/dashboard" />} />
        
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
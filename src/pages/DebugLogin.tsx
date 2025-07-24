import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

export default function DebugLogin() {
  const [email, setEmail] = useState('udayashok1997@gmail.com');
  const [results, setResults] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkUserStatus = async () => {
    setIsChecking(true);
    setResults(null);

    try {
      console.log('🔍 Checking user status for:', email);
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const debugInfo = {
        supabaseConfigured: !!(supabaseUrl && supabaseKey),
        supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
        supabaseKey: supabaseKey ? 'Configured' : 'Missing',
        timestamp: new Date().toISOString()
      };

      console.log('🔧 Supabase Configuration:', debugInfo);

      if (!supabase) {
        setResults({
          error: 'Supabase not configured properly',
          debugInfo
        });
        return;
      }

      // Try to get current session
      console.log('📋 Checking current session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('📋 Session result:', { sessionData, sessionError });

      // Try to get user by email (this won't work with RLS, but we can try)
      console.log('👤 Checking auth users...');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('👤 User result:', { userData, userError });

      // Check providers table
      console.log('🏢 Checking providers table...');
      let providerData = null;
      let providerError = null;
      
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('email', email);
        providerData = data;
        providerError = error;
      } catch (err) {
        providerError = err;
      }
      
      console.log('🏢 Provider result:', { providerData, providerError });

      // Try a simple test query to check database connectivity
      console.log('🔗 Testing database connectivity...');
      let connectivityTest = null;
      let connectivityError = null;
      
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('count')
          .limit(1);
        connectivityTest = data;
        connectivityError = error;
      } catch (err) {
        connectivityError = err;
      }

      console.log('🔗 Connectivity result:', { connectivityTest, connectivityError });

      // Try to sign in with the credentials
      console.log('🔐 Testing login credentials...');
      let loginTest = null;
      let loginError = null;
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: '070597'
        });
        loginTest = data;
        loginError = error;
        
        // If login successful, immediately sign out to not affect current session
        if (data.user && !error) {
          console.log('✅ Login test successful, signing out...');
          await supabase.auth.signOut();
        }
      } catch (err) {
        loginError = err;
      }

      console.log('🔐 Login test result:', { loginTest, loginError });

      setResults({
        debugInfo,
        session: { data: sessionData, error: sessionError },
        user: { data: userData, error: userError },
        provider: { data: providerData, error: providerError },
        connectivity: { data: connectivityTest, error: connectivityError },
        loginTest: { 
          success: !!(loginTest?.user && !loginError),
          user: loginTest?.user ? {
            id: loginTest.user.id,
            email: loginTest.user.email,
            emailConfirmed: loginTest.user.email_confirmed_at,
            role: loginTest.user.user_metadata?.role,
            createdAt: loginTest.user.created_at
          } : null,
          error: loginError 
        }
      });

    } catch (error) {
      console.error('❌ Debug check failed:', error);
      setResults({
        error: error.message,
        debugInfo: {
          supabaseConfigured: false,
          error: error.message
        }
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug User Login</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to check"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button 
              onClick={checkUserStatus}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Check Status'}
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Configuration Status:</h3>
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(results.debugInfo, null, 2)}
                </pre>
              </div>

              {results.loginTest && (
                <div className={`p-4 rounded-lg ${results.loginTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  <h3 className="font-semibold mb-2">
                    Login Test: {results.loginTest.success ? '✅ SUCCESS' : '❌ FAILED'}
                  </h3>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(results.loginTest, null, 2)}
                  </pre>
                </div>
              )}

              {results.provider && (
                <div className="bg-blue-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Provider Data:</h3>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(results.provider, null, 2)}
                  </pre>
                </div>
              )}

              {results.connectivity && (
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Database Connectivity:</h3>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(results.connectivity, null, 2)}
                  </pre>
                </div>
              )}

              {results.error && (
                <div className="bg-red-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Error:</h3>
                  <p className="text-red-800">{results.error}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click "Check Status" to test your credentials</li>
            <li>Check the console (F12) for detailed logs</li>
            <li>The results will show if your account exists and why login might be failing</li>
            <li>Look for the "Login Test" section to see if credentials are valid</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
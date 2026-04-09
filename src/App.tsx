import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import Login from '@/components/Login';
import Sidebar from '@/components/Sidebar';
import LicenseKeys from '@/components/LicenseKeys';
import LicenseLogs from '@/components/LicenseLogs';
import { Toaster } from '@/components/ui/ui-sonner';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ui-card';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'keys' | 'logs'>('keys');

  if (!isSupabaseConfigured) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans">
          <Card className="w-full max-w-md border-red-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-900">Configuration Required</CardTitle>
              <CardDescription>
                Supabase environment variables are missing.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 space-y-4">
              <p>Please set the following secrets in the <b>Settings &gt; Secrets</b> panel:</p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
                <li>VITE_ADMIN_PASSWORD</li>
              </ul>
              <p className="text-xs italic">After setting the secrets, the app will be able to connect to your database.</p>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );
  }

  // Check if already logged in (simple session persistence)
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('admin_session', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_session');
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <Login onLogin={handleLogin} />
        <Toaster position="top-center" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'keys' ? <LicenseKeys /> : <LicenseLogs />}
          </div>
        </main>
        
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

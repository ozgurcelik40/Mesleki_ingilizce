import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import FieldSelection from './pages/FieldSelection';
import Courses from './pages/Courses';
import LearningModule from './pages/LearningModule';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

type Route = '/' | '/login' | '/signup' | '/dashboard' | '/profile' | '/field-selection' | '/courses' | '/learning-module' | '/admin' | '/forgot-password' | '/reset-password';

function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>('/');
  const { user, loading, recoveryMode } = useAuth();

  useEffect(() => {
    const path = window.location.pathname as Route;
    setCurrentRoute(path);

    const handleRouteChange = () => {
      const newPath = window.location.pathname as Route;
      setCurrentRoute(newPath);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (recoveryMode) {
        if (currentRoute !== '/reset-password') {
          window.history.pushState({}, '', '/reset-password');
          setCurrentRoute('/reset-password');
        }
        return;
      }

      if (user && (currentRoute === '/' || currentRoute === '/login' || currentRoute === '/signup' || currentRoute === '/forgot-password')) {
        window.history.pushState({}, '', '/dashboard');
        setCurrentRoute('/dashboard');
      } else if (!user && (currentRoute === '/dashboard' || currentRoute === '/profile' || currentRoute === '/field-selection' || currentRoute === '/courses' || currentRoute === '/learning-module' || currentRoute === '/admin')) {
        window.history.pushState({}, '', '/login');
        setCurrentRoute('/login');
      }
    }
  }, [user, loading, currentRoute, recoveryMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  switch (currentRoute) {
    case '/login':
      return <Login />;
    case '/signup':
      return <Signup />;
    case '/forgot-password':
      return <ForgotPassword />;
    case '/reset-password':
      return <ResetPassword />;
    case '/dashboard':
      return <Dashboard />;
    case '/profile':
      return <Profile />;
    case '/field-selection':
      return <FieldSelection />;
    case '/courses':
      return <Courses />;
    case '/learning-module':
      return <LearningModule />;
    case '/admin':
      return <Admin />;
    default:
      return <Home />;
  }
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;

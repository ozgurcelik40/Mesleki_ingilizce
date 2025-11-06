import { GraduationCap, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
  currentPage: 'home' | 'courses' | 'profile' | 'admin';
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">{t('nav.siteName')}</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/dashboard"
              className={currentPage === 'home' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-gray-900'}
            >
              {t('nav.home')}
            </a>
            <a
              href="/courses"
              className={currentPage === 'courses' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-gray-900'}
            >
              {t('nav.courses')}
            </a>
         
            
            {profile?.is_admin && (
              <a
                href="/admin"
                className={currentPage === 'admin' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-gray-900'}
              >
                {t('nav.admin')}
              </a>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button className="hidden md:block text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
            </button>
            <a href="/profile" className="hidden md:block">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {profile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                  </span>
                </div>
              )}
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
           <a href="/profile" className="md:block">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {profile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                  </span>
                </div>
              )}
            </a>
              
              <a
                href="/dashboard"
                className={currentPage === 'home' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-gray-900'}
              >
                {t('nav.home')}
              </a>
              <a
                href="/courses"
                className={currentPage === 'courses' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-gray-900'}
              >
                {t('nav.courses')}
              </a>              
              {profile?.is_admin && (
                <a
                  href="/admin"
                  className={currentPage === 'admin' ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-gray-900'}
                >
                  {t('nav.admin')}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { translations } from '../lib/translations';

type Language = 'English' | 'Turkish';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('Turkish');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLanguagePreference();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadLanguagePreference = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('interface_language')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setLanguageState(data.interface_language as Language);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);

    if (user) {
      try {
        await supabase
          .from('user_settings')
          .upsert(
            {
              user_id: user.id,
              interface_language: lang,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id',
            }
          );
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

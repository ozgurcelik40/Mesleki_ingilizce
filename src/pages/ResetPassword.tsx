import { useState, useEffect } from 'react';
import { GraduationCap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkRecoveryToken = async () => {
      const hash = window.location.hash.substring(1);

      if (!hash) {
        setError('Şifre sıfırlama bağlantısı bulunamadı');
        return;
      }

      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const type = params.get('type');

      if (!accessToken || type !== 'recovery') {
        setError('Geçersiz bağlantı');
        return;
      }

      try {
        await supabase.auth.signOut();

        await new Promise(resolve => setTimeout(resolve, 300));

        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });

        if (sessionError || !data.session) {
          setError('Oturum başlatılamadı. Lütfen tekrar deneyin.');
          return;
        }

        window.history.replaceState({}, document.title, '/reset-password');
        setIsReady(true);
      } catch (err) {
        setError('Beklenmeyen bir hata oluştu');
      }
    };

    checkRecoveryToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError('Şifre güncellenemedi. Lütfen tekrar deneyin.');
      } else {
        setSuccess(true);
        await supabase.auth.signOut();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (error && !isReady) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 pt-20">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold">
                    <span className="text-gray-900">Mesleki</span>
                    <span className="text-blue-600">İngilizce</span>
                  </span>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium">Oturum geçersiz</p>
                <p className="mt-1">{error}</p>
              </div>
              <a
                href="/forgot-password"
                className="block mt-6 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Şifre Sıfırlama Sayfasına Dön
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isReady) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 pt-20">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold">
                    <span className="text-gray-900">Mesleki</span>
                    <span className="text-blue-600">İngilizce</span>
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold">
                  <span className="text-gray-900">Mesleki</span>
                  <span className="text-blue-600">İngilizce</span>
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Yeni Şifre Belirle
            </h1>

            {success ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Şifre başarıyla sıfırlandı!</p>
                  <p>Giriş sayfasına yönlendiriliyorsunuz. Lütfen yeni şifrenizle giriş yapın.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                      placeholder="Yeni şifrenizi girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Şifreyi Onayla
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                      placeholder="Şifrenizi tekrar girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Şifre Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { GraduationCap, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError('E-posta gönderilemedi. Lütfen e-posta adresini kontrol edin.');
      } else {
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
              Şifremi Sıfırla
            </h1>
            <p className="text-center text-gray-600 text-sm mb-8">
              Hesabınızda kullanılan e-posta adresini girin. Size şifre sıfırlama bağlantısı göndereceğiz.
            </p>

            {success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">E-posta gönderildi!</p>
                  <p>Lütfen e-posta kutunuzu kontrol edin ve şifre sıfırlama bağlantısını takip edin.</p>
                </div>
                <a
                  href="/login"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Giriş Sayfasına Dön</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="E-posta adresinizi girin"
                    />
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
                  {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama E-postası Gönder'}
                </button>

                <a
                  href="/login"
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Giriş Sayfasına Dön
                </a>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

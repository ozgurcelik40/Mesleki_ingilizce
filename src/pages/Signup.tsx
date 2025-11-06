import { useState } from 'react';
import { GraduationCap, Eye, EyeOff, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const professionalFields = [
  'IT',
  'Elektrik-Elektronik',
  'Kimya',
  'Mobilya',
  'Biyomedikal',
  'HVAC',
  'Mekanik',
];

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [professionalField, setProfessionalField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError('Lütfen adınızı girin');
      return;
    }

    if (!lastName.trim()) {
      setError('Lütfen soyadınızı girin');
      return;
    }

    if (!professionalField) {
      setError('Lütfen bir mesleki alan seçin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (!agreedToTerms) {
      setError('Devam etmek için kullanım koşullarını kabul etmelisiniz');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, firstName, lastName, professionalField);
      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setError('Bu e-posta adresi zaten kullanılıyor');
        } else if (error.message.includes('Profile update failed')) {
          setError('Profil oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        } else if (error.message.includes('Invalid email')) {
          setError('Geçersiz e-posta adresi');
        } else if (error.message.includes('Password')) {
          setError('Şifre çok zayıf. Daha güçlü bir şifre deneyin.');
        } else {
          setError('Kayıt olurken bir hata oluştu: ' + error.message);
        }
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-blue-50 rounded-full">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Hesap Oluştur
          </h1>
          <p className="text-gray-600 text-center text-sm mb-8">
            Kariyerinizi profesyonel İngilizce ile bir sonraki seviyeye taşıyın.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pl-11"
                    placeholder="Adınız"
                  />
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pl-11"
                    placeholder="Soyadınız"
                  />
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pl-11"
                  placeholder="ornek@eposta.com"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="Şifrenizi girin"
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
                Şifre Tekrar
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

            <div>
              <label htmlFor="professionalField" className="block text-sm font-medium text-gray-700 mb-2">
                Mesleki Alan
              </label>
              <select
                id="professionalField"
                required
                value={professionalField}
                onChange={(e) => setProfessionalField(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Bir alan seçin</option>
                {professionalFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                <a href="#" className="text-blue-600 hover:text-blue-700">Kullanım Koşulları</a>
                'nı ve{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">Gizlilik Politikası</a>
                'nı okudum ve kabul ediyorum.
              </label>
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
              {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Zaten bir hesabın var mı?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Giriş Yap
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

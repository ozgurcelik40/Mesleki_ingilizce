import { useState, useEffect, useRef } from 'react';
import { User, Lock, Settings, Trash2, GraduationCap, Bell, Upload, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, UserSettings } from '../lib/supabase';
import Navigation from '../components/Navigation';

type TabType = 'personal' | 'security' | 'settings';

const professionalFields = [
  'IT',
  'Elektrik-Elektronik',
  'Kimya',
  'Mobilya',
  'Biyomedikal',
  'HVAC',
  'Mekanik',
];

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { t, language: contextLanguage, setLanguage: setContextLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [professionalField, setProfessionalField] = useState(profile?.professional_field || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [progressReminders, setProgressReminders] = useState(true);
  const [newContentAlerts, setNewContentAlerts] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Turkish'>('English');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  useEffect(() => {
    setLanguage(contextLanguage);
  }, [contextLanguage]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setProfessionalField(profile.professional_field || '');
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    }
  }, [profile]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProgressReminders(data.progress_reminders);
        setNewContentAlerts(data.new_content_alerts);
        const lang = data.interface_language as 'English' | 'Turkish';
        setLanguage(lang);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePersonalInfoSave = async () => {
    setMessage('');
    setError('');

    try {
      const { error } = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        professional_field: professionalField,
      });

      if (error) {
        setError('Bilgiler güncellenirken bir hata oluştu');
      } else {
        setMessage('Bilgileriniz başarıyla güncellendi');
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    }
  };

  const handlePasswordUpdate = async () => {
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage('Şifreniz başarıyla güncellendi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Şifre güncellenirken bir hata oluştu');
    }
  };

  const handleSettingsSave = async () => {
    setMessage('');
    setError('');

    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            progress_reminders: progressReminders,
            new_content_alerts: newContentAlerts,
            interface_language: language,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) throw error;

      await setContextLanguage(language);
      setMessage(t('profile.settingsSaved'));
    } catch (err) {
      setError(t('profile.errorUpdating'));
      console.error('Error saving settings:', err);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage('');
      setError('');

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      if (file.size > 2 * 1024 * 1024) {
        setError('Dosya boyutu 2MB\'dan küçük olmalıdır');
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const { error: updateError } = await updateProfile({
        avatar_url: publicUrl,
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setMessage('Profil resminiz başarıyla güncellendi');
    } catch (err) {
      setError('Resim yüklenirken bir hata oluştu');
      console.error('Error uploading avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setUploading(true);
      setMessage('');
      setError('');

      if (!profile?.avatar_url) return;

      const urlParts = profile.avatar_url.split('/');
      const filePath = `${user?.id}/${urlParts[urlParts.length - 1]}`;

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      const { error: updateError } = await updateProfile({
        avatar_url: null,
      });

      if (updateError) throw updateError;

      setAvatarUrl(null);
      setMessage('Profil resminiz başarıyla silindi');
    } catch (err) {
      setError('Resim silinirken bir hata oluştu');
      console.error('Error deleting avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation currentPage="profile" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-600">
                        {profile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : 'User'}
                </h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{t('profile.personalInfo')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">{t('profile.security')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">{t('profile.settings')}</span>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('auth.logout')}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {message && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.personalInfo')}</h2>
                <p className="text-gray-600 mb-6">{t('profile.personalInfoSubtitle')}</p>

                <div className="flex items-center space-x-4 mb-8">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-600">
                        {profile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {profile?.first_name && profile?.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : 'User'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {professionalField || 'IT Professional'}
                    </p>
                  </div>
                  <div className="flex-1"></div>
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploading ? t('profile.uploading') : t('profile.uploadPhoto')}</span>
                    </button>
                    {avatarUrl && (
                      <button
                        onClick={handleAvatarDelete}
                        disabled={uploading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                      >
                        {t('profile.delete')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.firstName')}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Elif"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.lastName')}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Yılmaz"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.professionalField')}
                    </label>
                    <select
                      value={professionalField}
                      onChange={(e) => setProfessionalField(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select a field</option>
                      {professionalFields.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handlePersonalInfoSave}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {t('profile.saveChanges')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.security')}</h2>
                <p className="text-gray-600 mb-6">{t('profile.securityExp')}</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('profile.currentPassword')}
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="••••••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.newPassword')}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.confirmNewPassword')}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handlePasswordUpdate}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {t('profile.updatePassword')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.notificationsName')}</h2>
                <p className="text-gray-600 mb-6">{t('profile.notificationsExp')}</p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.notifications')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{t('profile.progressReminders')}</p>
                          <p className="text-sm text-gray-600">{t('profile.progressRemindersDesc')}</p>
                        </div>
                        <button
                          onClick={() => setProgressReminders(!progressReminders)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            progressReminders ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              progressReminders ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{t('profile.newContentAlerts')}</p>
                          <p className="text-sm text-gray-600">{t('profile.newContentAlertsDesc')}</p>
                        </div>
                        <button
                          onClick={() => setNewContentAlerts(!newContentAlerts)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            newContentAlerts ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              newContentAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.language')}</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.interfaceLanguage')}
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'English' | 'Turkish')}
                        className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Turkish">Türkçe</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <button className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                      <span className="font-medium">{t('profile.deleteAccount')}</span>
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSettingsSave}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {t('profile.saveSettings')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

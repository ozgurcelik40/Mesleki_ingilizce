import { GraduationCap, Zap, FlaskConical, Hammer, HeartPulse, Wind, Cog, Laptop, Sparkles, Briefcase, Users } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

interface VocationalField {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
}

const vocationalFields: VocationalField[] = [
  {
    id: 'it',
    title: 'IT',
    description: 'Yazılım ve donanım terminolojisi',
    icon: <Laptop className="w-8 h-8" />,
  },
  {
    id: 'electronics',
    title: 'Elektrik-Elektronik',
    description: 'Devreler ve sistemler için İngilizce',
    icon: <Zap className="w-8 h-8" />,
  },
  {
    id: 'chemistry',
    title: 'Kimya',
    description: 'Laboratuvar ve endüstriyel kimya',
    icon: <FlaskConical className="w-8 h-8" />,
  },
  {
    id: 'furniture',
    title: 'Mekanik',
    description: 'Mühendislik ve üretim süreçleri',
    icon: <Cog className="w-8 h-8" />,
  },
  {
    id: 'biomedical',
    title: 'Biyomedikal',
    description: 'Tıbbi cihazlar ve teknoloji',
    icon: <HeartPulse className="w-8 h-8" />,
  },
  {
    id: 'hvac',
    title: 'HVAC',
    description: 'İklimlendirme sistemleri',
    icon: <Wind className="w-8 h-8" />,
  },
];

export default function Home() {
    const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{t('home.siteName')}</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#courses" className="text-gray-700 hover:text-gray-900">{t('home.courses')}</a>
              <a href="#about" className="text-gray-700 hover:text-gray-900">{t('home.aboutus')}</a>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('home.login')}
              </a>
              <a
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('home.signUp')}
              </a>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Mesleğinizin İngilizcesini Bizimle Öğrenin
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Kariyerinize özel olarak tasarlanmış İngilizce kurslarıyla profesyonel dil becerilerinizi bir üst seviyeye taşıyın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Hemen Başla
            </a>
            <a
              href="#courses"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg border-2 border-gray-200"
            >
              Kursları Keşfet
            </a>
          </div>
        </div>
      </section>

      <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Uzmanlık Alanları</h2>
          <p className="text-lg text-gray-600">
            Kariyerinize uygun kursu seçin ve öğrenmeye başlayın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vocationalFields.map((field) => (
            <a
              key={field.id}
              href="/courses"
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group block"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                  {field.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{field.title}</h3>
                  <p className="text-gray-600 text-sm">{field.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 font-medium">Ve Daha Fazlası</p>
          <p className="text-sm text-gray-500">Yeni kurslar yakında eklenecek.</p>
        </div>
      </section>

      <section id="about" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden Bizimle Öğrenmelisiniz?</h2>
            <p className="text-lg text-gray-600">
              Platformumuz, kariyer hedeflerinize ulaşmanız için tasarlanmış benzersiz özellikler sunar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Etkileşimli Dersler</h3>
              <p className="text-gray-600">
                Aktif katılımınızı sağlayan dinamik ve ilgi çekici ders materyalleri ile öğrenin.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gerçek Hayat Senaryoları</h3>
              <p className="text-gray-600">
                Mesleğinizde karşılaşacağınız gerçek durumları simüle eden pratik alıştırmalar yapın.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Uzman Liderliğinde İçerik</h3>
              <p className="text-gray-600">
                Sektör profesyonelleri tarafından hazırlanan güncü ve doğru içeriklerle eğitin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nasıl Çalışır?</h2>
          <p className="text-lg text-gray-600">
            Sadece 3 basit adımda kariyeriniz için İngilizce öğrenmeye başlayın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4 text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Alanı Seç</h3>
            <p className="text-gray-600">
              Uzmanlığınız istediğiniz mesleki alanı seçin.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4 text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Öğrenmeye Başla</h3>
            <p className="text-gray-600">
              Etkileşimli dersler ve pratik alıştırmalarla öğrenin.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4 text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Kariyerini İlerlet</h3>
            <p className="text-gray-600">
              Yeni dil becerilerinizle profesyonel hedeflerinize ulaşın.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-6xl mb-4">"</div>
            <p className="text-xl text-white mb-6 italic">
              Bu platform sayesinde IT alanındaki teknik İngilizce bilgim inanılmaz gelişti.
              Artık uluslararası projelerde çok daha özgüvenliyim. Herkese tavsiye ederim!
            </p>
            <p className="text-white font-semibold">Ahmet Yılmaz</p>
            <p className="text-blue-100 text-sm">Yazılım Geliştirici</p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GraduationCap className="w-5 h-5" />
              <span className="font-semibold">{t('home.rights')}</span>
            </div>
            <div className="flex space-x-6">        
              <a href="#" className="text-gray-400 hover:text-white">{t('home.contact')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

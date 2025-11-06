import { useState } from 'react';
import { GraduationCap, Laptop, Zap, FlaskConical, Armchair, HeartPulse, Wind, Wrench, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Field {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
}

const fields: Field[] = [
  {
    id: 'it',
    title: 'IT',
    description: 'Learn English for the world of information technology.',
    icon: <Laptop className="w-12 h-12 text-blue-600" />,
  },
  {
    id: 'electrical',
    title: 'Elektrik-Elektronik',
    description: 'Master the language of circuits and electronics.',
    icon: <Zap className="w-12 h-12 text-blue-600" />,
  },
  {
    id: 'chemistry',
    title: 'Kimya',
    description: 'Understand English terminology for chemical processes.',
    icon: <FlaskConical className="w-12 h-12 text-blue-600" />,
  },
  {
    id: 'mechanical',
    title: 'Mekanik',
    description: 'Develop your English skills for mechanical engineering.',
    icon: <Wrench className="w-12 h-12 text-blue-600" />,
  },
  {
    id: 'furniture',
    title: 'Mobilya',
    description: 'Communicate effectively in the furniture industry.',
    icon: <Armchair className="w-12 h-12 text-blue-600" />,
  },
  {
    id: 'biomedical',
    title: 'Biyomedikal',
    description: 'Specialize your English for biomedical fields.',
    icon: <HeartPulse className="w-12 h-12 text-blue-600" />,
  },
  {
    id: 'hvac',
    title: 'HVAC',
    description: 'Learn key English terms for heating and ventilation.',
    icon: <Wind className="w-12 h-12 text-blue-600" />,
  },
];

type ViewMode = 'card' | 'list';

export default function FieldSelection() {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFieldSelect = async (fieldId: string, fieldTitle: string) => {
    setLoading(true);
    try {
      await updateProfile({ professional_field: fieldTitle });
      window.location.href = '/courses';
    } catch (error) {
      console.error('Error selecting field:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Vocational English</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/dashboard" className="text-gray-700 hover:text-gray-900">Home</a>
              <a href="#about" className="text-gray-700 hover:text-gray-900">About</a>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log In
              </a>
              <a href="/profile">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Professional Field
          </h1>
          <p className="text-lg text-gray-600">
            Choose a field below to start learning specialized English.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="font-medium">Card View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="font-medium">List View</span>
            </button>
          </div>
        </div>

        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => handleFieldSelect(field.id, field.title)}
                disabled={loading}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="mb-4">{field.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {field.title}
                </h3>
                <p className="text-sm text-gray-600">{field.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => handleFieldSelect(field.id, field.title)}
                disabled={loading}
                className="w-full bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all flex items-start space-x-4 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex-shrink-0">{field.icon}</div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {field.title}
                  </h3>
                  <p className="text-sm text-gray-600">{field.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="mb-4 md:mb-0">
              © 2024 Vocational English. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

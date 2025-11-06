import { useEffect, useState, useMemo } from 'react';
import { BookOpen, Clock, Award, Laptop, Zap, FlaskConical, Wrench, Armchair, HeartPulse, Wind, HardHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Course } from '../lib/supabase';
import Navigation from '../components/Navigation';

interface CourseWithStats extends Course {
  totalLessons: number;
  totalHours: number;
}

export default function Courses() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, [profile]);

  useEffect(() => {
    if (profile?.professional_field && selectedField === 'all') {
      setSelectedField(profile.professional_field);
    }
  }, [profile]);

  const loadCourses = async () => {
    try {
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .order('field');

      if (error) throw error;

      const coursesWithStats = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { data: modulesData } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', course.id);

          const moduleIds = (modulesData || []).map(m => m.id);

          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('duration_minutes')
            .in('module_id', moduleIds.length > 0 ? moduleIds : ['']);

          const totalLessons = (lessonsData || []).length;
          const totalMinutes = (lessonsData || []).reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0);
          const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

          return {
            ...course,
            totalLessons,
            totalHours
          };
        })
      );

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseIcon = (field: string) => {
    const iconClass = "w-12 h-12";
    const fieldLower = field.toLowerCase();

    if (fieldLower === 'it') {
      return <Laptop className={iconClass} />;
    } else if (fieldLower.includes('elektrik') || fieldLower.includes('electrical') || fieldLower.includes('elektronik')) {
      return <Zap className={iconClass} />;
    } else if (fieldLower.includes('kimya') || fieldLower.includes('chemistry')) {
      return <FlaskConical className={iconClass} />;
    } else if (fieldLower.includes('mekanik') || fieldLower.includes('mechanical')) {
      return <Wrench className={iconClass} />;
    } else if (fieldLower.includes('mobilya') || fieldLower.includes('furniture')) {
      return <Armchair className={iconClass} />;
    } else if (fieldLower.includes('biyomedikal') || fieldLower.includes('biomedical')) {
      return <HeartPulse className={iconClass} />;
    } else if (fieldLower === 'hvac' || fieldLower.includes('iklimlendirme')) {
      return <Wind className={iconClass} />;
    } else if (fieldLower.includes('construction') || fieldLower.includes('inşaat')) {
      return <HardHat className={iconClass} />;
    } else {
      return <BookOpen className={iconClass} />;
    }
  };

  const groupedCourses = useMemo(() => {
    const groups: { [key: string]: CourseWithStats[] } = {};
    courses.forEach((course) => {
      if (!groups[course.field]) {
        groups[course.field] = [];
      }
      groups[course.field].push(course);
    });
    return groups;
  }, [courses]);

  const fields = useMemo(() => Object.keys(groupedCourses).sort(), [groupedCourses]);

  const filteredCourses = useMemo(() => {
    if (selectedField === 'all') {
      return courses;
    }
    return courses.filter(course => course.field === selectedField);
  }, [courses, selectedField]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation currentPage="courses" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('courses.title')}</h1>
          <p className="text-gray-600">
            {t('courses.subtitle')}
          </p>
        </div>

        {fields.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedField('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedField === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t('courses.allFields')}
              </button>
              {fields.map((field) => (
                <button
                  key={field}
                  onClick={() => setSelectedField(field)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedField === field
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>
        )}

        {profile?.professional_field && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('courses.yourField')}</h3>
                <p className="text-gray-700">
                  {t('courses.yourFieldDesc').replace('{{field}}', profile.professional_field)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <div className="text-white">
                  {getCourseIcon(course.field)}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {course.field}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {course.description || t('courses.learnProfessional')}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.totalHours > 0 ? `${course.totalHours} ${course.totalHours === 1 ? t('courses.hour') : t('courses.hours')}` : t('courses.noLessons')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.totalLessons} {course.totalLessons === 1 ? t('courses.lesson') : t('courses.lessons')}</span>
                  </div>
                </div>
                <a
                  href={`/learning-module?field=${encodeURIComponent(course.field)}`}
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('courses.startLearning')}
                </a>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('courses.noCourses')}</h3>
            <p className="text-gray-600">{t('courses.checkBack')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

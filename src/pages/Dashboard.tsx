import { useEffect, useState } from 'react';
import { Play, CheckCircle, FileText, Award, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, UserProgress, Achievement, Activity } from '../lib/supabase';
import Navigation from '../components/Navigation';

interface ProgressStats {
  totalPoints: number;
  coursesCompleted: number;
  hoursStudied: number;
  currentStreak: number;
  overallProgress: number;
}

interface CourseProgress {
  field: string;
  progress: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<ProgressStats>({
    totalPoints: 0,
    coursesCompleted: 0,
    hoursStudied: 0,
    currentStreak: 0,
    overallProgress: 0,
  });
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveCourse, setHasActiveCourse] = useState(false);
  const [lastActiveField, setLastActiveField] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [progressData, achievementsData, activitiesData] = await Promise.all([
        supabase
          .from('user_progress')
          .select('*, courses(field, title)')
          .eq('user_id', user.id),
        supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false })
          .limit(5),
        supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (progressData.data) {
        const completedCourses = progressData.data.filter(p => p.progress_percentage === 100);
        const totalPoints = activitiesData.data?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;
        const hoursStudied = Math.round(progressData.data.reduce((sum, p) => sum + (p.hours_studied || 0), 0) * 10) / 10;
        const coursesCompleted = completedCourses.length;
        const maxStreak = Math.max(...progressData.data.map(p => p.current_streak || 0), 0);
        const avgProgress = progressData.data.length > 0
          ? Math.round(progressData.data.reduce((sum, p) => sum + p.progress_percentage, 0) / progressData.data.length)
          : 0;

        setStats({
          totalPoints,
          coursesCompleted,
          hoursStudied,
          currentStreak: maxStreak,
          overallProgress: avgProgress,
        });

        const courseProgressData = progressData.data.map((p: any) => ({
          field: p.courses?.field || 'Unknown',
          progress: p.progress_percentage,
        }));
        setCourseProgress(courseProgressData);

        const activeCourses = progressData.data.filter(p => p.progress_percentage < 100);
        setHasActiveCourse(activeCourses.length > 0);

        if (activeCourses.length > 0) {
          const sortedActiveCourses = [...activeCourses].sort((a, b) => {
            const dateA = new Date(a.last_accessed || a.updated_at);
            const dateB = new Date(b.last_accessed || b.updated_at);
            return dateB.getTime() - dateA.getTime();
          });
          setLastActiveField(sortedActiveCourses[0].courses?.field || null);
        }
      }

      if (achievementsData.data) {
        setAchievements(achievementsData.data);
      }

      if (activitiesData.data) {
        setActivities(activitiesData.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const continueLearning = () => {
    if (lastActiveField) {
      window.location.href = `/learning-module?field=${encodeURIComponent(lastActiveField)}`;
    } else if (profile?.professional_field) {
      window.location.href = `/learning-module?field=${encodeURIComponent(profile.professional_field)}`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'passed':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'earned':
        return <Award className="w-5 h-5 text-amber-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

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
      <Navigation currentPage="home" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('dashboard.welcome').replace('{{name}}', profile?.first_name || 'User')}
            </p>
          </div>
          <button
            onClick={continueLearning}
            disabled={!hasActiveCourse}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>{t('dashboard.continueLearning')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalPoints')}</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.coursesCompleted')}</p>
            <p className="text-3xl font-bold text-gray-900">{stats.coursesCompleted}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.hoursStudied')}</p>
            <p className="text-3xl font-bold text-gray-900">{stats.hoursStudied}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.learningStreak')}</p>
            <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} {t('dashboard.days')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.overallProgress')}</h2>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={502}
                      strokeDashoffset={502 - (502 * stats.overallProgress) / 100}
                      className="text-blue-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{stats.overallProgress}%</span>
                    <span className="text-sm text-gray-600">{t('dashboard.completed')}</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-4">{t('dashboard.keepItUp')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.progressByField')}</h2>
              <div className="space-y-4">
                {courseProgress.length > 0 ? (
                  courseProgress.map((course, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{course.field}</span>
                          {course.progress === 100 && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              {t('dashboard.completed')}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">{t('dashboard.noCourseProgress')}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.recentActivity')}</h2>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">+{activity.points} {t('dashboard.points')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm text-center py-4">{t('dashboard.noActivity')}</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.achievements')}</h2>
              <div className="grid grid-cols-5 gap-3">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center"
                      title={achievement.title}
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center truncate w-full">
                        {achievement.title.split(' ')[0]}
                      </p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex flex-col items-center opacity-50">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center opacity-50">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

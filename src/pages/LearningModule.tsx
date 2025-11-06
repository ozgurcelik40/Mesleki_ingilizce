import { useState, useEffect } from 'react';
import { GraduationCap, Bell, ChevronDown, ChevronUp, CheckCircle, FileText, BookOpen, Play, ArrowLeft, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';
import { useLanguage } from '../contexts/LanguageContext';

interface Lesson {
  id: string;
  title: string;
  content: string;
  lesson_type: 'video' | 'reading' | 'quiz' | 'exercise';
  video_url?: string;
  order_index: number;
  duration_minutes: number;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
  expanded: boolean;
}

interface Vocabulary {
  id: string;
  term: string;
  definition: string;
  example_sentence?: string;
  pronunciation?: string;
}

interface Course {
  id: string;
  title: string;
  field: string;
}

type TabType = 'content' | 'vocabulary' | 'exercises' | 'resources';

export default function LearningModule() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [overallCompletion, setOverallCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fieldParam = params.get('field');
    console.log('URL field parameter:', fieldParam);
    console.log('Profile field:', profile?.professional_field);
    if (fieldParam) {
      console.log('Setting field from URL:', fieldParam);
      setSelectedField(fieldParam);
    } else if (profile?.professional_field) {
      console.log('Setting field from profile:', profile.professional_field);
      setSelectedField(profile.professional_field);
    }
  }, [profile]);

  useEffect(() => {
    if (selectedField) {
      loadCourseData();
    }
  }, [selectedField, user]);

  useEffect(() => {
    if (modules.length > 0 && course && user) {
      const totalLessons = modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
      const completedLessons = modules.reduce(
        (sum, mod) => sum + mod.lessons.filter(l => l.completed).length,
        0
      );
      const completion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      setOverallCompletion(completion);
    }
  }, [modules, course, user]);

  const loadCourseData = async () => {
    try {
      if (!selectedField) return;

      console.log('Loading course for field:', selectedField);
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('field', selectedField)
        .single();

      console.log('Course data:', courseData);
      console.log('Course error:', courseError);

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseData.id)
        .order('order_index');

      if (modulesError) throw modulesError;

      const modulesWithLessons = await Promise.all(
        (modulesData || []).map(async (module) => {
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index');

          if (lessonsError) throw lessonsError;

          const lessonsWithCompletion = await Promise.all(
            (lessonsData || []).map(async (lesson) => {
              const { data: completionData } = await supabase
                .from('lesson_completions')
                .select('*')
                .eq('lesson_id', lesson.id)
                .eq('user_id', user?.id)
                .maybeSingle();

              return {
                ...lesson,
                completed: !!completionData,
              };
            })
          );

          return {
            ...module,
            lessons: lessonsWithCompletion,
            expanded: false,
          };
        })
      );

      setModules(modulesWithLessons);

      if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
        const firstIncompleteLesson = modulesWithLessons
          .flatMap((mod) => mod.lessons)
          .find((lesson) => !lesson.completed);

        const lessonToShow = firstIncompleteLesson || modulesWithLessons[0].lessons[0];
        setCurrentLesson(lessonToShow);
        loadVocabulary(lessonToShow.id);

        setModules(prev => prev.map(mod => ({
          ...mod,
          expanded: mod.lessons.some(l => l.id === lessonToShow.id)
        })));

        const totalLessons = modulesWithLessons.reduce((sum, mod) => sum + mod.lessons.length, 0);
        const completedLessons = modulesWithLessons.reduce(
          (sum, mod) => sum + mod.lessons.filter(l => l.completed).length,
          0
        );
        const initialCompletion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        await initializeUserProgress(courseData.id, initialCompletion, modulesWithLessons);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVocabulary = async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('term');

      if (error) throw error;
      setVocabulary(data || []);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    }
  };

  const initializeUserProgress = async (courseId: string, progressPercentage: number, modulesData: Module[]) => {
    if (!user) return;

    try {
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing progress:', fetchError);
        return;
      }

      const completedLessons = modulesData.reduce(
        (sum, mod) => sum + mod.lessons.filter(l => l.completed).length,
        0
      );
      const totalMinutes = modulesData.reduce((sum, mod) =>
        sum + mod.lessons.filter(l => l.completed).reduce((s, l) => s + l.duration_minutes, 0), 0
      );
      const hoursStudied = Math.floor(totalMinutes / 60);

      if (!existingProgress) {
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert([{
            user_id: user.id,
            course_id: courseId,
            progress_percentage: progressPercentage,
            lessons_completed: completedLessons,
            hours_studied: hoursStudied,
            last_accessed: new Date().toISOString(),
          }]);

        if (insertError) {
          console.error('Error initializing progress:', insertError);
        }
      } else {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            progress_percentage: progressPercentage,
            lessons_completed: completedLessons,
            hours_studied: hoursStudied,
            last_accessed: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);

        if (updateError) {
          console.error('Error updating progress:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in initializeUserProgress:', error);
    }
  };

  const updateUserProgress = async (progressPercentage: number, updatedModules: Module[]) => {
    if (!user || !course) return;

    try {
      const modulesToUse = updatedModules || modules;
      const totalLessons = modulesToUse.reduce((sum, mod) => sum + mod.lessons.length, 0);
      const completedLessons = modulesToUse.reduce(
        (sum, mod) => sum + mod.lessons.filter(l => l.completed).length,
        0
      );
      const totalMinutes = modulesToUse.reduce((sum, mod) =>
        sum + mod.lessons.filter(l => l.completed).reduce((s, l) => s + l.duration_minutes, 0), 0
      );
      const hoursStudied = Math.floor(totalMinutes / 60);

      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingProgress) {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            progress_percentage: progressPercentage,
            lessons_completed: completedLessons,
            hours_studied: hoursStudied,
            last_accessed: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert([{
            user_id: user.id,
            course_id: course.id,
            progress_percentage: progressPercentage,
            lessons_completed: completedLessons,
            hours_studied: hoursStudied,
            last_accessed: new Date().toISOString(),
          }]);

        if (insertError) throw insertError;
      }

      if (progressPercentage === 100 && (!existingProgress || existingProgress.progress_percentage < 100)) {
        await createCompletionActivity();
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  };

  const createCompletionActivity = async () => {
    if (!user || !course) return;

    try {
      const { error } = await supabase
        .from('activities')
        .insert([{
          user_id: user.id,
          activity_type: 'completed',
          title: `Completed ${course.field} course`,
          points: 100,
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating completion activity:', error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setModules(modules.map(mod =>
      mod.id === moduleId ? { ...mod, expanded: !mod.expanded } : mod
    ));
  };

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    loadVocabulary(lesson.id);
    setActiveTab('content');
  };

  const markLessonComplete = async () => {
    if (!currentLesson || !user) return;

    try {
      const { error } = await supabase
        .from('lesson_completions')
        .insert([{
          user_id: user.id,
          lesson_id: currentLesson.id,
          completed_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      setModules(prev => {
        const updatedModules = prev.map(mod => ({
          ...mod,
          lessons: mod.lessons.map(l =>
            l.id === currentLesson.id ? { ...l, completed: true } : l
          ),
        }));

        const totalLessons = updatedModules.reduce((sum, mod) => sum + mod.lessons.length, 0);
        const completedLessons = updatedModules.reduce(
          (sum, mod) => sum + mod.lessons.filter(l => l.completed).length,
          0
        );
        const completion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        updateUserProgress(completion, updatedModules);

        return updatedModules;
      });

      setCurrentLesson(prev => prev ? { ...prev, completed: true } : null);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const goToNextLesson = async () => {
    if (!currentLesson) return;

    if (!currentLesson.completed) {
      await markLessonComplete();
    }

    const allLessons = modules.flatMap(mod => mod.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);

    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      selectLesson(nextLesson);
    }
  };

  const goToPreviousLesson = () => {
    if (!currentLesson) return;

    const allLessons = modules.flatMap(mod => mod.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);

    if (currentIndex > 0) {
      const previousLesson = allLessons[currentIndex - 1];
      selectLesson(previousLesson);
    }
  };

  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5 text-gray-400" />;
      case 'reading':
        return <FileText className="w-5 h-5 text-gray-400" />;
      case 'quiz':
      case 'exercise':
        return <BookOpen className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('modules.loading')}</p>
        </div>
      </div>
    );
  }

  if (!course || modules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('modules.nocontent')}</h2>
          <p className="text-gray-600 mb-6">{t('modules.selectfield')}</p>
          <a
            href="/profile"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     <Navigation currentPage="profile" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{t('modules.courseprogress')}</p>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('modules.overalprogress')}</span>
                  <span className="text-sm font-semibold text-blue-600">{overallCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${overallCompletion}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                {modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">{module.title}</span>
                      {module.expanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {module.expanded && (
                      <div className="border-t border-gray-200">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson(lesson)}
                            className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left ${
                              currentLesson?.id === lesson.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            {getLessonIcon(lesson.lesson_type, lesson.completed)}
                            <span className={`text-sm ${currentLesson?.id === lesson.id ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                              {lesson.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {currentLesson && (
              <>
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <a href="/courses" className="hover:text-gray-900">{t('modules.allcourses')}</a>
                    <span>/</span>
                    <a href="/courses" className="hover:text-gray-900">{course.field}</a>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{currentLesson.title}</span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {currentLesson.title}
                  </h1>

                  {currentLesson.lesson_type === 'video' && currentLesson.video_url && (
                    <div className="bg-black rounded-xl overflow-hidden mb-6 relative aspect-video">
                      <iframe
                        src={currentLesson.video_url.replace('watch?v=', 'embed/')}
                        title={currentLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200">
                    <div className="border-b border-gray-200">
                      <div className="flex space-x-8 px-6">
                        <button
                          onClick={() => setActiveTab('content')}
                          className={`py-4 border-b-2 transition-colors ${
                            activeTab === 'content'
                              ? 'border-blue-600 text-blue-600 font-medium'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                         {t('modules.lessoncontent')}
                        </button>
                        <button
                          onClick={() => setActiveTab('vocabulary')}
                          className={`py-4 border-b-2 transition-colors ${
                            activeTab === 'vocabulary'
                              ? 'border-blue-600 text-blue-600 font-medium'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {t('modules.vocabulary')} ({vocabulary.length})
                        </button>
                        <button
                          onClick={() => setActiveTab('exercises')}
                          className={`py-4 border-b-2 transition-colors ${
                            activeTab === 'exercises'
                              ? 'border-blue-600 text-blue-600 font-medium'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {t('modules.exercises')}
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {activeTab === 'content' && (
                        <div className="prose max-w-none">
                          <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                            {currentLesson.content}
                          </p>
                          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-6">
                            <h3 className="font-semibold text-gray-900 mb-2">{t('modules.lessoninfo')}</h3>
                            <ul className="space-y-2 text-gray-700">
                              <li>• {t('modules.duration')}: {currentLesson.duration_minutes} {t('modules.minutes')}</li>
                              <li>• {t('modules.type')}: {currentLesson.lesson_type}</li>
                              <li>• {t('modules.status')}: {currentLesson.completed ? 'Completed' : 'In Progress'}</li>
                            </ul>
                          </div>
                          {!currentLesson.completed && (
                            <button
                              onClick={markLessonComplete}
                              className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              {t('modules.complete')}
                            </button>
                          )}
                        </div>
                      )}

                      {activeTab === 'vocabulary' && (
                        <div className="space-y-4">
                          {vocabulary.length > 0 ? (
                            vocabulary.map((vocab) => (
                              <div key={vocab.id} className="border-b border-gray-200 pb-4">
                                <h3 className="font-semibold text-gray-900 mb-1">{vocab.term}</h3>
                                {vocab.pronunciation && (
                                  <p className="text-sm text-gray-500 mb-1">/{vocab.pronunciation}/</p>
                                )}
                                <p className="text-gray-600 text-sm mb-2">{vocab.definition}</p>
                                {vocab.example_sentence && (
                                  <p className="text-gray-700 italic"> {t('modules.example')}: "{vocab.example_sentence}"</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-600"> {t('modules.novocabulary')}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'exercises' && (
                        <div className="text-center py-8">
                          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('modules.practic')}</h3>
                          <p className="text-gray-600 mb-6">
                            {t('modules.completelesson')}
                          </p>
                          {currentLesson.completed && (
                            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                              {t('modules.startexercises')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-8">
                    <button
                      onClick={goToPreviousLesson}
                      disabled={modules.flatMap(m => m.lessons).findIndex(l => l.id === currentLesson.id) === 0}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span className="font-medium"> {t('modules.previouslesson')}</span>
                    </button>
                    <button
                      onClick={goToNextLesson}
                      disabled={
                        modules.flatMap(m => m.lessons).findIndex(l => l.id === currentLesson.id) ===
                        modules.flatMap(m => m.lessons).length - 1
                      }
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="font-medium"> {t('modules.nextlesson')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

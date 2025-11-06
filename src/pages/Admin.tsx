import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, BookOpen, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';

const professionalFields = [
  'IT',
  'Elektrik-Elektronik',
  'Kimya',
  'Mobilya',
  'Biyomedikal',
  'HVAC',
  'Mekanik',
];

interface Course {
  id: string;
  title: string;
  description: string;
  field: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  lesson_type: 'video' | 'reading' | 'quiz' | 'exercise';
  video_url?: string;
  order_index: number;
  duration_minutes: number;
}

interface Vocabulary {
  id: string;
  lesson_id: string;
  term: string;
  definition: string;
  example_sentence?: string;
  pronunciation?: string;
}

export default function Admin() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'courses' | 'modules' | 'lessons' | 'vocabulary'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [viewFilterCourseId, setViewFilterCourseId] = useState<string>('');
  const [viewFilterModuleId, setViewFilterModuleId] = useState<string>('');

  useEffect(() => {
    if (!profile?.is_admin) {
      window.location.href = '/dashboard';
      return;
    }
    loadData();
  }, [profile, activeTab]);

  useEffect(() => {
    if (activeTab === 'lessons' || activeTab === 'vocabulary' || activeTab === 'modules') {
      loadAllCourses();
      loadAllModules();
      if (activeTab === 'vocabulary' || activeTab === 'lessons') {
        loadAllLessons();
      }
    }
    setViewFilterCourseId('');
    setViewFilterModuleId('');
  }, [activeTab]);

  useEffect(() => {
    if (selectedCourseId) {
      const filtered = modules.filter(m => m.course_id === selectedCourseId);
      setFilteredModules(filtered);
      setSelectedModuleId('');
      if (editingItem) {
        setEditingItem({ ...editingItem, module_id: '', lesson_id: '' });
      }
    } else {
      setFilteredModules(modules);
    }
  }, [selectedCourseId, modules]);

  useEffect(() => {
    if (selectedModuleId) {
      const filtered = lessons.filter(l => l.module_id === selectedModuleId);
      setFilteredLessons(filtered);
      if (editingItem) {
        setEditingItem({ ...editingItem, lesson_id: '' });
      }
    } else {
      setFilteredLessons(lessons);
    }
  }, [selectedModuleId, lessons]);

  const loadAllCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('title');
    setCourses(data || []);
  };

  const loadAllModules = async () => {
    const { data } = await supabase.from('modules').select('*').order('title');
    setModules(data || []);
  };

  const loadAllLessons = async () => {
    const { data } = await supabase.from('lessons').select('*').order('title');
    setLessons(data || []);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'courses':
          const { data: coursesData } = await supabase.from('courses').select('*').order('title');
          setCourses(coursesData || []);
          break;
        case 'modules':
          const { data: modulesData } = await supabase.from('modules').select('*').order('title');
          setModules(modulesData || []);
          break;
        case 'lessons':
          const { data: lessonsData } = await supabase.from('lessons').select('*').order('title');
          setLessons(lessonsData || []);
          break;
        case 'vocabulary':
          const { data: vocabData } = await supabase.from('vocabulary').select('*').order('term');
          setVocabulary(vocabData || []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    switch (activeTab) {
      case 'courses':
        setEditingItem({ title: '', description: '', field: '' });
        break;
      case 'modules':
        const filteredModulesForOrder = viewFilterCourseId
          ? modules.filter(m => m.course_id === viewFilterCourseId)
          : modules;
        const maxOrderIndex = filteredModulesForOrder.length > 0
          ? Math.max(...filteredModulesForOrder.map(m => m.order_index))
          : -1;
        setEditingItem({
          course_id: viewFilterCourseId || '',
          title: '',
          description: '',
          order_index: maxOrderIndex + 1
        });
        break;
      case 'lessons':
        const filteredLessonsForOrder = viewFilterModuleId
          ? lessons.filter(l => l.module_id === viewFilterModuleId)
          : viewFilterCourseId
          ? lessons.filter(l => {
              const moduleIds = modules.filter(m => m.course_id === viewFilterCourseId).map(m => m.id);
              return moduleIds.includes(l.module_id);
            })
          : lessons;
        const maxLessonOrderIndex = filteredLessonsForOrder.length > 0
          ? Math.max(...filteredLessonsForOrder.map(l => l.order_index))
          : -1;
        setSelectedCourseId(viewFilterCourseId || '');
        setEditingItem({
          module_id: viewFilterModuleId || '',
          title: '',
          content: '',
          lesson_type: 'reading',
          video_url: '',
          order_index: maxLessonOrderIndex + 1,
          duration_minutes: 0
        });
        break;
      case 'vocabulary':
        setEditingItem({ lesson_id: '', term: '', definition: '', example_sentence: '', pronunciation: '' });
        break;
    }
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const { error } = await supabase.from(activeTab).insert([editingItem]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(activeTab).update(editingItem).eq('id', editingItem.id);
        if (error) throw error;
      }
      setEditingItem(null);
      setIsCreating(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from(activeTab).delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting data. Please try again.');
    }
  };

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation currentPage="admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.contentManagement')}</h1>
          <p className="text-gray-600">{t('admin.contentManagementDesc')}</p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('admin.courses')}
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('admin.modules')}
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lessons'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('admin.lessons')}
            </button>
            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vocabulary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('admin.vocabulary')}
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.addNew')}</span>
          </button>

          {activeTab === 'modules' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t('admin.filterByCourse')}:</label>
              <select
                value={viewFilterCourseId}
                onChange={(e) => setViewFilterCourseId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('admin.allCourses')}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.field} - {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'lessons' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{t('admin.filterByCourse')}:</label>
                <select
                  value={viewFilterCourseId}
                  onChange={(e) => {
                    setViewFilterCourseId(e.target.value);
                    setViewFilterModuleId('');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('admin.allCourses')}</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.field} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{t('admin.filterByModule')}:</label>
                <select
                  value={viewFilterModuleId}
                  onChange={(e) => setViewFilterModuleId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!viewFilterCourseId}
                >
                  <option value="">{t('admin.allModules')}</option>
                  {modules.filter(m => !viewFilterCourseId || m.course_id === viewFilterCourseId).map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTab === 'vocabulary' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{t('admin.filterByCourse')}:</label>
                <select
                  value={viewFilterCourseId}
                  onChange={(e) => {
                    setViewFilterCourseId(e.target.value);
                    setViewFilterModuleId('');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('admin.allCourses')}</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.field} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{t('admin.filterByModule')}:</label>
                <select
                  value={viewFilterModuleId}
                  onChange={(e) => setViewFilterModuleId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!viewFilterCourseId}
                >
                  <option value="">{t('admin.allModules')}</option>
                  {modules.filter(m => !viewFilterCourseId || m.course_id === viewFilterCourseId).map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {isCreating ? t('admin.createNew') : t('admin.edit')} {activeTab.slice(0, -1)}
                </h2>
                <button onClick={() => { setEditingItem(null); setIsCreating(false); }}>
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="space-y-4">
                {activeTab === 'courses' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.field')}</label>
                      <select
                        value={editingItem.field}
                        onChange={(e) => setEditingItem({ ...editingItem, field: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{t('auth.selectField')}</option>
                        {professionalFields.map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.title')}</label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.description')}</label>
                      <textarea
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'modules' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.courseId')}</label>
                      <select
                        value={editingItem.course_id}
                        onChange={(e) => setEditingItem({ ...editingItem, course_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{t('admin.selectCourse')}</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.field} - {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.title')}</label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.description')}</label>
                      <textarea
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.orderIndex')}</label>
                      <input
                        type="number"
                        value={editingItem.order_index}
                        onChange={(e) => setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'lessons' && (
                  <>
                    {isCreating && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.course')}</label>
                          <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">{t('admin.selectCourse')}</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.field} - {course.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.module')}</label>
                      <select
                        value={editingItem.module_id}
                        onChange={(e) => setEditingItem({ ...editingItem, module_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isCreating && !selectedCourseId}
                      >
                        <option value="">{t('admin.selectModule')}</option>
                        {(isCreating ? filteredModules : modules).map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.title')}</label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.content')}</label>
                      <textarea
                        value={editingItem.content}
                        onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.typeLesson')}</label>
                      <select
                        value={editingItem.lesson_type}
                        onChange={(e) => setEditingItem({ ...editingItem, lesson_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="video">{t('admin.video')}</option>
                        <option value="reading">{t('admin.reading')}</option>
                        <option value="quiz">{t('admin.quiz')}</option>
                        <option value="exercise">{t('admin.exercise')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.videoUrl')}</label>
                      <input
                        type="text"
                        value={editingItem.video_url || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, video_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.orderIndex')}</label>
                        <input
                          type="number"
                          value={editingItem.order_index}
                          onChange={(e) => setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.duration')}</label>
                        <input
                          type="number"
                          value={editingItem.duration_minutes}
                          onChange={(e) => setEditingItem({ ...editingItem, duration_minutes: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'vocabulary' && (
                  <>
                    {isCreating && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.course')}</label>
                          <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">{t('admin.selectCourse')}</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.field} - {course.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.module')}</label>
                          <select
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedCourseId}
                          >
                            <option value="">{t('admin.selectModule')}</option>
                            {filteredModules.map((module) => (
                              <option key={module.id} value={module.id}>
                                {module.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.lesson')}</label>
                      <select
                        value={editingItem.lesson_id}
                        onChange={(e) => setEditingItem({ ...editingItem, lesson_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isCreating && !selectedModuleId}
                      >
                        <option value="">{t('admin.selectLesson')}</option>
                        {(isCreating ? filteredLessons : lessons).map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.term')}</label>
                      <input
                        type="text"
                        value={editingItem.term}
                        onChange={(e) => setEditingItem({ ...editingItem, term: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.definition')}</label>
                      <textarea
                        value={editingItem.definition}
                        onChange={(e) => setEditingItem({ ...editingItem, definition: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.exampleSentence')}</label>
                      <textarea
                        value={editingItem.example_sentence || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, example_sentence: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.pronunciation')}</label>
                      <input
                        type="text"
                        value={editingItem.pronunciation || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, pronunciation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => { setEditingItem(null); setIsCreating(false); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('admin.save')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {activeTab === 'courses' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.field')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.title')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.description')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                      </>
                    )}
                    {activeTab === 'modules' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.title')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.description')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.order')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                      </>
                    )}
                    {activeTab === 'lessons' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.title')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.type')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.duration')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.order')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                      </>
                    )}
                    {activeTab === 'vocabulary' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.term')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.definition')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.example')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === 'courses' && courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.field}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{course.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingItem(course)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'modules' && modules.filter(m => !viewFilterCourseId || m.course_id === viewFilterCourseId).map((module) => (
                    <tr key={module.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{module.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{module.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{module.order_index}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingItem(module)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(module.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'lessons' && lessons.filter(l => {
                    if (viewFilterModuleId) return l.module_id === viewFilterModuleId;
                    if (viewFilterCourseId) {
                      const moduleIds = modules.filter(m => m.course_id === viewFilterCourseId).map(m => m.id);
                      return moduleIds.includes(l.module_id);
                    }
                    return true;
                  }).map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{lesson.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lesson.lesson_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lesson.duration_minutes} min</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lesson.order_index}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingItem(lesson)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'vocabulary' && vocabulary.filter(v => {
                    if (viewFilterModuleId) {
                      const lessonIds = lessons.filter(l => l.module_id === viewFilterModuleId).map(l => l.id);
                      return lessonIds.includes(v.lesson_id);
                    }
                    if (viewFilterCourseId) {
                      const moduleIds = modules.filter(m => m.course_id === viewFilterCourseId).map(m => m.id);
                      const lessonIds = lessons.filter(l => moduleIds.includes(l.module_id)).map(l => l.id);
                      return lessonIds.includes(v.lesson_id);
                    }
                    return true;
                  }).map((vocab) => (
                    <tr key={vocab.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{vocab.term}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vocab.definition}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vocab.example_sentence || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingItem(vocab)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vocab.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

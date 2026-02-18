import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCourse, validateCourse } from '../services/courseService';
import { ArrowLeft, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function AddCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'lessons', 'quizzes'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    tags: [],
    emoji: '📚',
    duration: '',
    lessonsCount: 0,
    color: '#4F46E5',
    bgColor: '#F3F4F6',
    lessons: {},
    quizzes: {}
  });

  // Lesson state
  const [currentLesson, setCurrentLesson] = useState({
    title: '',
    content: '',
    type: 'text',
    duration: '10 min',
    emoji: '📝'
  });

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState({
    title: '',
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Lesson handlers
  const handleAddLesson = () => {
    if (!currentLesson.title) {
      alert('Please enter a lesson title');
      return;
    }
    const lessonId = `lesson${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      lessons: {
        ...prev.lessons,
        [lessonId]: { ...currentLesson, id: lessonId }
      },
      lessonsCount: prev.lessonsCount + 1
    }));
    setCurrentLesson({ title: '', content: '', type: 'text', duration: '10 min', emoji: '📝' });
  };

  const handleRemoveLesson = (lessonId) => {
    const newLessons = { ...formData.lessons };
    delete newLessons[lessonId];
    setFormData(prev => ({
      ...prev,
      lessons: newLessons,
      lessonsCount: prev.lessonsCount - 1
    }));
  };

  // Quiz handlers
  const handleAddQuestion = () => {
    if (!currentQuestion.question) {
      alert('Please enter a question');
      return;
    }
    setCurrentQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));
    setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
  };

  const handleAddQuiz = () => {
    if (!currentQuiz.title) {
      alert('Please enter a quiz title');
      return;
    }
    if (currentQuiz.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    const quizId = `quiz${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      quizzes: {
        ...prev.quizzes,
        [quizId]: { ...currentQuiz, id: quizId }
      }
    }));
    setCurrentQuiz({ title: '', questions: [] });
  };

  const handleRemoveQuiz = (quizId) => {
    const newQuizzes = { ...formData.quizzes };
    delete newQuizzes[quizId];
    setFormData(prev => ({ ...prev, quizzes: newQuizzes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateCourse(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    try {
      setLoading(true);
      await addCourse(formData);
      navigate('/courses');
    } catch (error) {
      setErrors({ submit: 'Failed to add course. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/courses')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Add New Course</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Course
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lessons' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              Lessons ({formData.lessonsCount})
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quizzes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
              }`}
            >
              Quizzes ({Object.keys(formData.quizzes).length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Python for Kids"
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe what students will learn..."
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags *</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add tags (e.g., python, games)"
                />
                <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              {errors.tags && <p className="mt-1 text-xs text-red-500">{errors.tags}</p>}
            </div>

            {/* Duration & Lessons Count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 4 weeks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lessons Count (auto)</label>
                <input
                  type="number"
                  name="lessonsCount"
                  value={formData.lessonsCount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>

            {/* Emoji & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                <input
                  type="text"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="📚"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Add New Lesson</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Lesson Title"
                  value={currentLesson.title}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="Lesson Content"
                  value={currentLesson.content}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="grid grid-cols-3 gap-4">
                  <select
                    value={currentLesson.type}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                    <option value="interactive">Interactive</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Duration"
                    value={currentLesson.duration}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, duration: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Emoji"
                    value={currentLesson.emoji}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, emoji: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button onClick={handleAddLesson} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4" /> Add Lesson
                </button>
              </div>
            </div>

            {/* Lessons List */}
            {Object.keys(formData.lessons).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Lessons</h2>
                <div className="space-y-3">
                  {Object.values(formData.lessons).map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lesson.emoji}</span>
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-sm text-gray-500">{lesson.duration}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveLesson(lesson.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Add New Quiz</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Quiz Title"
                  value={currentQuiz.title}
                  onChange={(e) => setCurrentQuiz({ ...currentQuiz, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Add Question</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Question"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {currentQuestion.options.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[idx] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer (0-3)</label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <button onClick={handleAddQuestion} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                  </div>
                </div>

                {currentQuiz.questions.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Questions ({currentQuiz.questions.length})</h3>
                    <div className="space-y-2">
                      {currentQuiz.questions.map((q, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded">
                          <p className="font-medium">{q.question}</p>
                          <p className="text-sm text-gray-500">Correct: {q.options[q.correctAnswer]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handleAddQuiz} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4">
                  <Plus className="w-4 h-4" /> Save Quiz
                </button>
              </div>
            </div>

            {/* Quizzes List */}
            {Object.keys(formData.quizzes).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Quizzes</h2>
                <div className="space-y-3">
                  {Object.values(formData.quizzes).map((quiz) => (
                    <div key={quiz.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{quiz.title}</p>
                        <p className="text-sm text-gray-500">{quiz.questions.length} questions</p>
                      </div>
                      <button onClick={() => handleRemoveQuiz(quiz.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
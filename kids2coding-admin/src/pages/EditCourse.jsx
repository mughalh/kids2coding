import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseById, updateCourse, validateCourse } from '../services/courseService';
import { ArrowLeft, Save, AlertCircle, Loader } from 'lucide-react';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    tags: [],
    emoji: '📚',
    duration: '',
    lessonsCount: 0,
    imageUrl: '',
    color: '#4F46E5'
  });
  const [tagInput, setTagInput] = useState('');

  // Fetch course data on mount
  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      const course = await getCourseById(id);
      
      if (course) {
        setFormData({
          title: course.title || '',
          description: course.description || '',
          level: course.level || 'beginner',
          tags: course.tags || [],
          emoji: course.emoji || '📚',
          duration: course.duration || '',
          lessonsCount: course.lessonsCount || 0,
          imageUrl: course.imageUrl || '',
          color: course.color || '#4F46E5'
        });
      } else {
        setFetchError('Course not found');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setFetchError('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
      
      // Clear tags error if any
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: null }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateCourse(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSaving(true);
      setErrors({});
      
      await updateCourse(id, formData);
      
      // Show success message (you could add a toast notification here)
      alert('Course updated successfully!');
      
      // Navigate back to courses list
      navigate('/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      setErrors({ 
        submit: 'Failed to update course. Please check your connection and try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure? Any unsaved changes will be lost.')) {
      navigate('/courses');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{fetchError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Go to Courses
            </button>
            <button
              onClick={fetchCourse}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                disabled={saving}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Edit Course</h1>
                <p className="text-sm text-gray-500">ID: {id}</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-600">{errors.submit}</p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-sm text-red-700 underline mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Python for Kids"
                disabled={saving}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe what students will learn..."
                disabled={saving}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Emoji */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Emoji
              </label>
              <input
                type="text"
                name="emoji"
                value={formData.emoji}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 📚, 🐍, 🎮"
                maxLength="2"
                disabled={saving}
              />
              <p className="mt-1 text-xs text-gray-500">
                Single emoji to represent the course
              </p>
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Details</h2>
            
            {/* Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="beginner">Beginner 🐣</option>
                <option value="intermediate">Intermediate 🚀</option>
                <option value="advanced">Advanced 🧠</option>
              </select>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tags ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Add tags (e.g., python, games)"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                  disabled={saving}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 focus:outline-none"
                      disabled={saving}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.tags && (
                <p className="mt-1 text-xs text-red-500">{errors.tags}</p>
              )}
            </div>

            {/* Duration & Lessons */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4 weeks"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lessons Count
                </label>
                <input
                  type="number"
                  name="lessonsCount"
                  value={formData.lessonsCount}
                  onChange={handleNumberChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h2>
            
            {/* Color Picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-10 p-1 border border-gray-300 rounded"
                  disabled={saving}
                />
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#RRGGBB"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/course-image.jpg"
                disabled={saving}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional: URL to course image/thumbnail
              </p>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Preview</h2>
            
            <div className="border rounded-lg p-4" style={{ borderColor: formData.color }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{formData.emoji || '📚'}</span>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: formData.color }}>
                    {formData.title || 'Course Title'}
                  </h3>
                  <p className="text-sm text-gray-500">{formData.duration || 'Duration TBD'}</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">
                {formData.description || 'Course description will appear here...'}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  {formData.level}
                </span>
                {formData.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                    {tag}
                  </span>
                ))}
                {formData.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{formData.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
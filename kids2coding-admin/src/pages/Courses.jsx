import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses, deleteCourse, addCourse } from '../services/courseService';
import { Plus, Edit2, Trash2, Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';

export default function Courses() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importPreview, setImportPreview] = useState([]);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
      setDeleteConfirm(null);
      setSuccess('Course deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        // Handle both array and single object
        const coursesToImport = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        // Validate each course
        const validCourses = coursesToImport.filter(course => 
          course.title && course.description && course.level
        );
        
        setImportPreview(validCourses);
        setImportData(JSON.stringify(validCourses, null, 2));
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  // Handle import
  const handleImport = async () => {
    try {
      setImportLoading(true);
      let coursesToImport;

      try {
        coursesToImport = JSON.parse(importData);
        if (!Array.isArray(coursesToImport)) {
          coursesToImport = [coursesToImport];
        }
      } catch (err) {
        setError('Invalid JSON format');
        return;
      }

      // Validate each course
      const validCourses = coursesToImport.filter(course => 
        course.title && course.description && course.level
      );

      if (validCourses.length === 0) {
        setError('No valid courses found in JSON');
        return;
      }

      // Import courses
      let importedCount = 0;
      for (const course of validCourses) {
        try {
          await addCourse({
            ...course,
            tags: course.tags || [],
            emoji: course.emoji || '📚',
            duration: course.duration || '',
            lessonsCount: course.lessonsCount || 0,
            color: course.color || '#4F46E5'
          });
          importedCount++;
        } catch (err) {
          console.error('Failed to import course:', course.title, err);
        }
      }

      // Refresh courses list
      await loadCourses();
      
      setSuccess(`Successfully imported ${importedCount} courses!`);
      setImportModal(false);
      setImportData('');
      setImportPreview([]);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to import courses');
    } finally {
      setImportLoading(false);
    }
  };

  // Download sample JSON
  const downloadSampleJSON = () => {
    const sampleCourses = [
      {
        title: "Python for Kids",
        description: "Learn Python programming with fun projects and games",
        level: "beginner",
        tags: ["python", "coding", "games"],
        emoji: "🐍",
        duration: "6 weeks",
        lessonsCount: 12,
        color: "#4F46E5"
      },
      {
        title: "JavaScript Adventures",
        description: "Create interactive websites and games with JavaScript",
        level: "intermediate",
        tags: ["javascript", "web", "games"],
        emoji: "⚡",
        duration: "8 weeks",
        lessonsCount: 16,
        color: "#F59E0B"
      }
    ];

    const blob = new Blob([JSON.stringify(sampleCourses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-courses.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError(null)} className="ml-2">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
            <div className="flex gap-3">
              {/* Import Button */}
              <button
                onClick={() => setImportModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Upload className="w-5 h-5" />
                Import JSON
              </button>
              
              {/* Add Course Button */}
              <button
                onClick={() => navigate('/add-course')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Add New Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-6">Get started by importing courses from JSON or adding manually</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setImportModal(true)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
              >
                <Upload className="w-5 h-5" />
                Import from JSON
              </button>
              <button
                onClick={() => navigate('/add-course')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Add Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: course.color || '#4F46E5', color: 'white' }}
                    >
                      {course.emoji || '📚'}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                      course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags?.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {course.duration && (
                    <p className="text-xs text-gray-500 mb-3">
                      Duration: {course.duration} • {course.lessonsCount || 0} lessons
                    </p>
                  )}

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/edit-course/${course.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit course"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    {deleteConfirm === course.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Import Courses from JSON</h2>
                <button
                  onClick={() => {
                    setImportModal(false);
                    setImportData('');
                    setImportPreview([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload JSON File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Sample Download */}
              <div className="mb-6">
                <button
                  onClick={downloadSampleJSON}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download sample JSON template
                </button>
              </div>

              {/* JSON Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste JSON Data
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => {
                    setImportData(e.target.value);
                    try {
                      const data = JSON.parse(e.target.value);
                      setImportPreview(Array.isArray(data) ? data : [data]);
                    } catch {
                      // Invalid JSON, ignore preview
                    }
                  }}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder='[{"title": "Python for Kids", "description": "...", "level": "beginner"}]'
                />
              </div>

              {/* Preview */}
              {importPreview.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Preview ({importPreview.length} courses ready to import)
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {importPreview.map((course, idx) => (
                      <div key={idx} className="text-xs text-gray-600 py-1 border-b border-gray-200 last:border-0">
                        {course.title} - {course.level} ({course.tags?.join(', ')})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setImportModal(false);
                    setImportData('');
                    setImportPreview([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importData || importLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {importLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import Courses
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
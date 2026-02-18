import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseById, updateCourse, validateCourse } from '../services/courseService';
import { ArrowLeft, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
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

  // ... (same lesson/quiz state as AddCourse)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
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
            color: course.color || '#4F46E5',
            bgColor: course.bgColor || '#F3F4F6',
            lessons: course.lessons || {},
            quizzes: course.quizzes || {}
          });
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // ... (same handlers for tags, lessons, quizzes as AddCourse)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateCourse(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    try {
      setSaving(true);
      await updateCourse(id, formData);
      navigate('/courses');
    } catch (error) {
      setErrors({ submit: 'Failed to update course.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  // Render similar JSX as AddCourse, with pre-filled values
  // ...
}
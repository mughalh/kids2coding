export const coursesData = [
  {
    id: 'web-basics',
    title: 'Web Wizards 🌐',
    emoji: '🌐',
    description: 'Build your first website with HTML & CSS',
    level: 'Beginner',
    duration: '4 weeks',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    lessons: 8,
    progress: 60,
    tags: ['HTML', 'CSS', 'Beginner'],
    instructor: 'Codey the Robot',
    badges: ['html-basics', 'css-styling'],
  },
  {
    id: 'javascript-journey',
    title: 'JavaScript Jungle 🐒',
    emoji: '🐒',
    description: 'Learn JavaScript through fun games',
    level: 'Beginner',
    duration: '6 weeks',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    lessons: 12,
    progress: 30,
    tags: ['JavaScript', 'Games', 'Logic'],
    instructor: 'Monkey Moe',
    badges: ['js-variables', 'js-functions'],
  },
  {
    id: 'python-pals',
    title: 'Python Pals 🐍',
    emoji: '🐍',
    description: 'Meet Python and solve cool puzzles',
    level: 'Beginner',
    duration: '8 weeks',
    color: '#10B981',
    bgColor: '#ECFDF5',
    lessons: 15,
    progress: 15,
    tags: ['Python', 'Puzzles', 'Games'],
    instructor: 'Python Pete',
    badges: ['python-intro'],
  },
  {
    id: 'game-dev',
    title: 'Game Galaxy 🎮',
    emoji: '🎮',
    description: 'Create your own games with code',
    level: 'Intermediate',
    duration: '10 weeks',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    lessons: 20,
    progress: 0,
    tags: ['Games', 'Creative', 'Logic'],
    instructor: 'Game Guru',
    badges: [],
  },
  {
    id: 'mobile-magic',
    title: 'Mobile Magic 📱',
    emoji: '📱',
    description: 'Build apps for phones and tablets',
    level: 'Intermediate',
    duration: '12 weeks',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    lessons: 18,
    progress: 0,
    tags: ['Apps', 'React Native', 'Mobile'],
    instructor: 'App Annie',
    badges: [],
  },
  {
    id: 'ai-adventures',
    title: 'AI Adventures 🤖',
    emoji: '🤖',
    description: 'Discover artificial intelligence',
    level: 'Advanced',
    duration: '8 weeks',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    lessons: 16,
    progress: 0,
    tags: ['AI', 'ML', 'Future'],
    instructor: 'AI Alex',
    badges: [],
  },
  {
    id: 'data-detectives',
    title: 'Data Detectives 🔍',
    emoji: '🔍',
    description: 'Solve mysteries with data science',
    level: 'Intermediate',
    duration: '10 weeks',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    lessons: 14,
    progress: 0,
    tags: ['Data', 'Charts', 'Analysis'],
    instructor: 'Data Dana',
    badges: [],
  },
  {
    id: 'web-wizards-2',
    title: 'Web Wizards 2 🧙‍♂️',
    emoji: '🧙‍♂️',
    description: 'Advanced web with React',
    level: 'Intermediate',
    duration: '12 weeks',
    color: '#F97316',
    bgColor: '#FFF7ED',
    lessons: 20,
    progress: 0,
    tags: ['React', 'Advanced', 'Web'],
    instructor: 'Wizard Will',
    badges: [],
  },
];

export const courseDetails = {
  'web-basics': {
    overview: 'Learn how websites work and build your own!',
    learningObjectives: [
      'Understand how the internet works',
      'Create web pages with HTML',
      'Style pages with CSS',
      'Add images and links',
      'Make responsive designs'
    ],
    syllabus: [
      {
        id: 'lesson-1',
        title: 'Hello, World Wide Web!',
        duration: '30 min',
        type: 'video',
        completed: true,
        emoji: '👋'
      },
      {
        id: 'lesson-2',
        title: 'HTML Tags are Magic Spells',
        duration: '45 min',
        type: 'interactive',
        completed: true,
        emoji: '✨'
      },
      {
        id: 'lesson-3',
        title: 'CSS: Painting Your Webpage',
        duration: '60 min',
        type: 'project',
        completed: false,
        emoji: '🎨'
      },
      // ... more lessons
    ],
    projects: [
      {
        title: 'Create Your Digital Business Card',
        emoji: '📇',
        description: 'Make a cool digital card to share with friends'
      },
      {
        title: 'Build a Mini Portfolio',
        emoji: '🎪',
        description: 'Showcase your coding projects'
      }
    ],
    quizzes: [
      {
        id: 'quiz-1',
        title: 'HTML Basics Quiz',
        questions: 10,
        passed: true,
        emoji: '📝'
      }
    ]
  }
  // ... other course details
};
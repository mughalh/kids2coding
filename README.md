# 🚀 Kids 2 Coding - Learn Programming Through Play

An interactive mobile learning platform that teaches programming concepts to children through gamified courses, lessons, and quizzes.

## 📱 Features

### For Learners
- **Interactive Courses** - Bite-sized coding lessons for kids aged 8-14
- **Progress Tracking** - XP points, levels, and daily streaks
- **Quizzes & Challenges** - Test knowledge and earn badges
- **Personal Dashboard** - View progress, continue learning
- **AI Buddy** - Get help when stuck (coming soon)

### For Parents/Teachers
- **Progress Monitoring** - Track learning journey
- **Achievement System** - Badges for completed milestones

### For Admins
- **Web Admin Panel** - Manage courses, lessons, and quizzes
- **Bulk Import** - Add multiple courses via JSON
- **Content Management** - Update learning materials dynamically

## 🛠️ Tech Stack

### Mobile App
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript

### Backend
- **Authentication**: Firebase Auth
- **Database**: Firebase Realtime Database
- **Hosting**: Firebase Hosting (admin panel)

### Admin Panel
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Deployment**: Vercel / Netlify

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI
- Firebase account

### Mobile App Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/kids2coding.git
cd kids2coding

# Install dependencies
npm install

# Create .env file with your Firebase config
echo "EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key" > .env
echo "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain" >> .env
echo "EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url" >> .env
# ... add other config vars

# Start the app
npx expo start
```

### Admin Panel Setup

```bash
cd kids2coding-admin
npm install
npm run dev
```

## 🔧 Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Create Realtime Database
4. Set up security rules (see `firebase-rules.json`)
5. Add your config to `.env` file

## 📁 Project Structure

```
kids2coding/
├── app/                    # Expo Router screens
│   ├── courses/            # Course-related screens
│   ├── dashboard.tsx       # Main dashboard
│   ├── profile.tsx         # User profile
│   └── home.tsx            # Login/signup screen
├── src/
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication
│   │   ├── useCourses.ts   # Course data
│   │   └── useProgress.ts  # Progress tracking
│   └── firebase/           # Firebase configuration
└── kids2coding-admin/      # Separate admin panel
    ├── src/
    │   ├── pages/          # Admin pages
    │   └── services/       # Firebase services
    └── public/
```

## 🎯 Core Features Implemented

- ✅ User registration & login (email/password)
- ✅ Course browsing with filters
- ✅ Lesson completion tracking
- ✅ Quiz scoring system
- ✅ XP & leveling system
- ✅ Daily streak tracking
- ✅ Badge achievements
- ✅ Admin content management
- ✅ JSON course import

## 🚀 Roadmap

- [ ] Social features (friends, leaderboards)
- [ ] Parent dashboard
- [ ] Offline mode
- [ ] Video lessons
- [ ] Interactive coding challenges
- [ ] AI-powered learning assistant

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Built with [Expo](https://expo.dev/)
- Backend by [Firebase](https://firebase.google.com/)

---

**Happy Coding! 🎮**

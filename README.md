# 🎯 Habit Tracker

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.38-3ECF8E?logo=supabase)

**A beautiful, gamified habit tracking application with advanced analytics, health metrics, and AI-powered journaling.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Deployment](#-deployment) • [Documentation](#-documentation)

</div>

---

## ✨ Overview

Habit Tracker is a modern, full-featured web application designed to help users build and maintain healthy habits through gamification, comprehensive analytics, and intuitive user experience. Built with React, TypeScript, and Supabase, it offers a seamless experience across web and mobile platforms as a Progressive Web App (PWA).

### 🎮 Key Highlights

- **Gamification System**: Earn XP, level up, maintain streaks, and unlock achievements
- **Advanced Analytics**: Visual insights with charts, heatmaps, and correlation analysis
- **Health Metrics**: Track sleep quality, hydration, nutrition, and mood with intuitive sliders
- **AI-Powered Journaling**: Generate daily summaries from journal entries and audio recordings
- **Progressive Web App**: Install on mobile devices with offline support
- **Beautiful UI/UX**: Modern design with dark/light mode, smooth animations, and responsive layout

---

## 🚀 Features

### 📊 Core Functionality

- ✅ **Daily & Weekly Habit Tracking** - Check off habits with satisfying animations
- 📈 **Comprehensive Analytics Dashboard** - Line charts, area charts, scatter plots, heatmaps, and correlation analysis
- 🎯 **Category Management** - Organize habits by custom categories with color coding
- 📱 **Mobile-First Design** - Optimized for mobile devices with touch-friendly interactions
- 🌓 **Dark/Light Mode** - Beautiful themes with smooth transitions
- 💾 **Offline Support** - Works without internet connection (PWA)

### 🎮 Gamification

- **XP System**: Earn 10 XP per completed habit
- **Leveling**: Level up based on total XP accumulation
- **Streaks**: Track daily streaks with visual feedback
- **Achievements**: Unlock badges for various milestones
- **Progress Visualization**: Visual progress bars and completion rates

### 💪 Health Metrics

- **Sleep Tracking**: Hours and quality rating (1-5 slider)
- **Hydration**: Track daily water intake (glasses)
- **Nutrition**: Rate daily nutrition (1-5 slider)
- **Mood Tracking**: Select from 6 emotion states (Happy, Angry, Stressed, Grateful, Sleepy, Neutral)
- **Sleep Notes**: Always-visible notes for sleep tracking

### 📝 Journaling & Media

- **Daily Journal Entries**: Rich text journaling with popup editor
- **Media Upload**: Upload images and videos for each day
- **Audio Recording**: Record voice notes directly in the browser
- **AI Summaries**: Generate daily summaries from journal entries and recordings
- **Summary Popup**: Click summaries to view in full-screen modal

### 📱 Mobile Features

- **PWA Support**: Install as native app on iOS and Android
- **Touch Optimized**: Large buttons, swipe gestures, sticky columns
- **Responsive Tables**: Scrollable habit tables with fixed columns
- **Mobile Audio Recording**: Full support for audio recording on mobile devices

### 🔧 Advanced Features

- **Habit Archiving**: Archive habits/categories (preserves analytics)
- **Custom Emojis**: 500+ emoji options for habits and categories
- **Custom Colors**: 48 pastel color options for categories
- **Data Export**: Export all data to Excel format
- **Time Tracking**: Track estimated vs actual time spent on habits
- **Priority System**: Set importance levels for habits
- **KPI Tracking**: Track habits by days, times, hours, or minutes

---

## 🛠 Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Recharts** - Chart library for analytics
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### Backend & Services

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Storage for media files
- **OpenAI API** - AI-powered journal summarization

### PWA & Mobile

- **Vite PWA Plugin** - Service worker and manifest
- **Capacitor** - Native mobile app framework
- **IndexedDB** - Client-side data storage

### Utilities

- **date-fns** - Date manipulation
- **xlsx** - Excel export functionality

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([supabase.com](https://supabase.com))
- (Optional) OpenAI API key for AI summaries

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key  # Optional, for AI summaries
```

4. **Set up Supabase database**

Run the SQL schema from `src/supabase-schema.sql` in your Supabase SQL Editor. This will create:
- Users table
- Habits table
- Habit completions table
- Health metrics table
- Achievements table
- Notification settings table
- Row Level Security policies
- Indexes for performance

5. **Set up Supabase Storage**

Create a storage bucket named `journal-media` with public access for media uploads.

6. **Run the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📖 Usage

### Creating Habits

1. Navigate to the Dashboard
2. Click "Add Habit" or use the quick-add form in daily view
3. Select an emoji, enter a name, set category, estimated time, and importance
4. Habits are automatically organized by category

### Tracking Habits

- **Daily View**: See all habits for a specific day, check them off, add notes
- **Weekly View**: See a week at a glance with a comprehensive table
- Click the circle icon to mark habits as complete
- Add notes by expanding a habit entry

### Health Metrics

1. Navigate to Health Metrics panel
2. Use sliders for Sleep Quality, Hydration, and Nutrition
3. Select mood from 6 emoji options
4. Enter sleep hours and notes
5. All data is automatically saved

### Journaling

1. Click on a day in weekly view or use the journal panel
2. Type your journal entry
3. (Optional) Upload images/videos or record audio
4. Click "Generate Summary" to create an AI-powered summary
5. Click on summaries to view in full-screen popup

### Analytics

1. Navigate to the Analytics page
2. View comprehensive charts and visualizations:
   - Activity heatmap
   - Category breakdown
   - Time tracking
   - Health metrics trends
   - Correlation analysis

---

## 🚢 Deployment

### Web Deployment (PWA)

#### Netlify (Recommended)

1. Build the project:
```bash
npm run build:skip-check
```

2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag and drop the `dist` folder
4. Add environment variables in site settings
5. Deploy!

#### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically on push

### Mobile App Deployment

The app can be built as a native iOS/Android app using Capacitor:

```bash
# Build for mobile
npm run build:mobile

# Open in Xcode (iOS)
npm run cap:ios

# Open in Android Studio
npm run cap:android
```

See `docs/` folder for detailed mobile deployment guides.

---

## 📁 Project Structure

```
habit-tracker/
├── src/
│   ├── components/
│   │   ├── Dashboard/          # Dashboard components
│   │   │   ├── WeeklyView.tsx  # Weekly habit table
│   │   │   ├── HabitList.tsx   # Daily habit list
│   │   │   ├── JournalPanel.tsx # Journal & media
│   │   │   ├── HealthMetricsPanel.tsx # Health tracking
│   │   │   ├── Header.tsx      # App header
│   │   │   ├── Navigation.tsx  # Navigation bar
│   │   │   ├── EmojiPicker.tsx # Emoji selector
│   │   │   ├── RGBColorPicker.tsx # Color selector
│   │   │   └── RatingSlider.tsx # Rating slider component
│   │   ├── Analytics/          # Analytics components
│   │   │   ├── ActivityHeatmap.tsx
│   │   │   ├── CategoryBreakdown.tsx
│   │   │   ├── HealthMetricsAnalytics.tsx
│   │   │   └── TimeTracking.tsx
│   │   └── Profile/            # Profile components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication
│   │   └── useGamification.ts  # Gamification logic
│   ├── lib/                    # Core libraries
│   │   ├── supabase.ts         # Supabase client
│   │   ├── db.ts               # Database operations
│   │   └── openai.ts           # OpenAI integration
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Analytics.tsx       # Analytics page
│   │   └── Profile.tsx         # Profile page
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   │   └── logger.ts           # Logging utility
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── public/                     # Static assets
├── docs/                       # Documentation
├── src/supabase-schema.sql     # Database schema
├── vite.config.ts              # Vite configuration
├── capacitor.config.ts         # Capacitor configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

---

## 🔐 Security

- **Row Level Security (RLS)**: All database tables use Supabase RLS policies
- **Authentication**: Secure authentication via Supabase Auth
- **Environment Variables**: Sensitive keys stored in environment variables
- **HTTPS Only**: Production deployments use HTTPS
- **Data Privacy**: All user data is isolated per user account

---

## 🧪 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production (with type checking)
npm run build:skip-check # Build for production (skip type checking)
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run cap:sync         # Sync Capacitor
npm run cap:ios          # Open iOS project
npm run cap:android      # Open Android project
```

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier (recommended) for formatting
- Component-based architecture
- Custom hooks for reusable logic

---

## 📚 Documentation

Additional documentation is available in the `docs/` folder:

- `DEPLOY_NOW.md` - Quick deployment guide
- `MOBILE_DEPLOYMENT.md` - Mobile app setup
- `SUPABASE_SETUP.md` - Database setup guide
- `OPENAI_SETUP.md` - AI summary setup
- And more...

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Charts by [Recharts](https://recharts.org/)

---

## 📧 Contact

For questions, issues, or suggestions, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ for building better habits**

⭐ Star this repo if you find it helpful!

</div>

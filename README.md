# 🍎 AI Calorie Tracker

A smart calorie tracking mobile app with AI-powered food recognition using Google's Gemini Vision API.

## ✨ Features

- 📸 **AI Food Recognition** - Snap a photo, AI identifies the food and estimates calories
- 🔥 **Streak Tracking** - Stay motivated with consecutive logging streaks
- 📊 **Macro Tracking** - Monitor protein, carbs, and fats in real-time
- 🎯 **Customizable Goals** - Set and edit daily calorie and macro targets
- ⚡ **Quick Eat** - Log favorite foods with one tap
- 👤 **Profile Management** - Edit personal info and preferences
- ⚙️ **App Settings** - Customize notifications, units, and more

## 🛠️ Tech Stack

### Frontend
- **React Native** with Expo
- **TypeScript**
- **Expo Router** for navigation
- **React Native Reanimated** for animations
- **Lucide Icons**

### Backend
- **Python FastAPI**
- **Google Gemini AI** (Vision & Text)
- **Supabase** (PostgreSQL database)
- **Pillow** for image processing

## 📱 Screenshots

[Add your screenshots here]

## 🚀 Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.9+
- Expo CLI
- Supabase account
- Google AI API key

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd calorie-tracker
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Set up environment variables**

Create a `.env` file in the `backend` directory:
```
GOOGLE_API_KEY=your_google_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

5. **Set up database**
- Run the SQL schema in `backend/schema.sql` on your Supabase project

6. **Update API URL**
- In `services/api.ts`, update `BASE_URL` to your backend URL

### Running the App

1. **Start the backend**
```bash
cd backend
python3 -m uvicorn main:app --reload
```

2. **Start the frontend**
```bash
npx expo start
```

3. **Open on your device**
- Scan QR code with Expo Go app (iOS/Android)
- Or press `w` for web

## 📁 Project Structure

```
calorie-tracker/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── onboarding.tsx     # Onboarding flow
│   ├── editProfile.tsx    # Profile editing
│   └── appSettings.tsx    # App settings
├── components/            # Reusable components
├── services/              # API service layer
├── context/               # React context providers
├── backend/               # FastAPI backend
│   ├── main.py           # API routes
│   ├── ai_service.py     # AI integration
│   └── schema.sql        # Database schema
└── constants/            # App constants & colors
```

## 🎯 Key Features Implementation

### AI Food Recognition
Uses Google Gemini Vision API to analyze food images and estimate nutritional values with fallback to mock data for reliability.

### Streak Calculation
Dynamically calculates consecutive logging days from the database, encouraging daily engagement.

### Real-time Updates
Dashboard updates immediately when meals are logged, providing instant feedback.

## 🔒 Security Notes

- Never commit `.env` files
- API keys are stored as environment variables
- Database credentials managed through Supabase

## 📝 License

MIT

## 👨‍💻 Author

Built by [Your Name]

---

⭐ If you found this project helpful, please give it a star!

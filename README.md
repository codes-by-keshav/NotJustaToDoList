# 🚀 AI-Powered Todo & Timetable App
![Screenshot 2025-07-05 011653](https://github.com/user-attachments/assets/0e27f894-4dfb-4656-a74b-91b7e21fa289)
![Screenshot 2025-07-05 011643](https://github.com/user-attachments/assets/d27d41e8-470a-435f-8b87-e136186c266c)
![Screenshot 2025-07-05 011622](https://github.com/user-attachments/assets/8a42fd77-c50f-410a-b857-d7958b256766)

A modern, feature-rich productivity application built with React and Vite, featuring AI-generated motivational quotes, comprehensive analytics, and intelligent task management.


## ✨ Features

### 📅 **Smart Task Management**
- **Today-focused scheduling** - Automatically filters tasks for the current day
- **Time-based organization** - Set start and end times for each task
- **Priority levels** - High, medium, and low priority classification
- **Category system** - Organize tasks by custom categories
- **Progress tracking** - Start, pause, complete, or mark tasks as failed
- **Automatic date rollover** - Fresh start each new day

### 🤖 **AI-Powered Motivation**
- **Dynamic quote generation** using Google's Gemini AI
- **Context-aware prompts** - Different quotes for different times of day
- **Task-specific motivation** - Quotes tailored to individual tasks
- **Smart notifications** - AI-generated reminders and encouragements
- **Quote management** - Like and save favorite quotes

### 📊 **Comprehensive Analytics**
- **Daily & Monthly views** with interactive date navigation
- **Completion rate tracking** with visual pie charts
- **Time analysis** - Planned vs. actual time spent
- **Category performance** breakdown with progress bars
- **Daily completion heatmap** for monthly patterns
- **Productivity scoring** algorithm
- **Success/failure rate** monitoring
- **Task distribution** by priority levels

### 🔔 **Smart Notifications**
- **Browser push notifications** with permission management
- **Task start reminders** - Notifications when tasks are scheduled to begin
- **Task end alerts** - Reminders when tasks should be completed
- **Periodic motivational quotes** throughout the day
- **Customizable notification frequency**

### 🎨 **Modern UI/UX**
- **Responsive design** - Works seamlessly on desktop and mobile
- **Dark theme** with gradient backgrounds and glass-morphism effects
- **Smooth animations** using Framer Motion
- **Interactive components** with hover effects and micro-interactions
- **Custom fonts** - Cookie for headings, Exo 2 for body text
- **Color-coded status** indicators for tasks

### ☁️ **Cloud Storage**
- **Firebase Firestore** integration for real-time data sync
- **Automatic backup** - All tasks saved to cloud
- **Cross-device sync** - Access your tasks from anywhere
- **Offline support** with data persistence

## 🛠️ Tech Stack

### **Frontend**
- **React** - Modern React with hooks and functional components
- **Vite** - Lightning-fast build tool and dev server
- **Framer Motion** - Smooth animations and transitions
- **React Icons** - Beautiful icon library
- **CSS3** - Custom animations and gradient backgrounds

### **Backend & Services**
- **Firebase Firestore** - NoSQL cloud database
- **Google Gemini AI** - Advanced language model for quote generation
- **Web Push API** - Browser notifications


## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase account
- Google AI Studio API key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-todo-app.git
   cd ai-todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Gemini AI Configuration
   VITE_GEMINI_API_KEY=your_gemini_api_key

   
   ```

4. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Copy your Firebase config values to the `.env` file

5. **Gemini AI Setup**
   - Get your API key from Google AI studio.
   - Add the key to your `.env` file

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage Guide

### **Adding Tasks**
1. Click the "+" button or "Add Task" button
2. Fill in task details:
   - **Title** - What you need to do
   - **Category** - Organization label
   - **Priority** - High, Medium, or Low
   - **Start Time** - When to begin
   - **End Time** - When to finish
3. Click "Add Task" to save

### **Managing Tasks**
- **Start** - Click play button when you begin working
- **Pause** - Temporarily stop the timer
- **Complete** - Mark as finished successfully
- **Fail** - Mark as unsuccessful (for tracking)
- **Delete** - Remove task permanently

### **Viewing Analytics**
1. Click the "Analytics" button in the header
2. Switch between Daily and Monthly views
3. Navigate dates using arrow buttons
4. Review completion rates, time efficiency, and category performance

### **Motivational Quotes**
- Quotes refresh automatically throughout the day
- Click the refresh button for a new quote
- Like quotes to save them locally
- Quotes adapt to time of day and context


### **Notification Settings**
- Browser will request permission on first load
- Notifications can be disabled in browser settings
- Timing can be adjusted in the notification service


## 🎯 Key Features Breakdown

### **Task Status System**
- **Pending** (Gray) - Not started yet
- **In Progress** (Blue) - Currently working
- **Completed** (Green) - Successfully finished
- **Failed** (Red) - Marked as unsuccessful
- **Overdue** (Orange) - Past scheduled time

### **Analytics Calculations**
- **Completion Rate** = (Completed Tasks / Total Tasks) × 100
- **Time Efficiency** = (Completed Hours / Planned Hours) × 100
- **Productivity Score** = ((Completed × 2 - Failed) / Total) × 50
- **Success Rate** = (Completed / (Completed + Failed)) × 100

### **AI Integration Features**
- **Context-aware generation** based on time of day
- **Randomization** to prevent repetitive quotes
- **Fallback systems** for API failures
- **Rate limiting** to respect API quotas

## 🔐 Security & Privacy

- **API keys** stored in environment variables
- **Local storage** for user preferences only
- **Cloud sync** via secure Firebase connection
- **No personal data** sent to AI services beyond task context
- **Browser notifications** require explicit user permission

## 🚀 Deployment

### **Vercel**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch


---

**Built by Keshav **

*Boost your productivity with AI-powered motivation and smart task management!*

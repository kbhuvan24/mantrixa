# Mantrixa 🚀

**Industry-grade tech education by working MNC engineers.**

> Built by Bhuvan & Tarun — Software Engineers at top MNCs — for B.Tech students who want to learn tech the way the industry actually uses it.

---

## 🌐 Live Pages

| Page | Route | Access |
|------|-------|--------|
| Home | `/` | Public |
| Learning Hub (Courses) | `/learning-hub` | Public |
| Login / Register | `/auth` | Public |
| Student Dashboard | `/dashboard` | Students |
| Exam Panel | `/exam-panel` | Students |
| Interview Prep | `/interview-panel` | Students |
| About Us & Reviews | `/about` | Public |
| Admin Panel | `/admin` | Admin only |

---

## 🔐 Credentials

**Admin Login:**
- Email: `admin@mantrixa.dev`
- Password: `StackAdmin@2024`

**Students:** Register at `/auth?mode=register`

---

## 🚀 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start
# Opens at http://localhost:3000
```

---

## 📦 Build for Production

```bash
npm run build
# Output in /build folder
```

---

## 🌍 Deploy to GitHub Pages

### One-time Setup:
1. Push this repo to GitHub (e.g. `github.com/YOUR_USERNAME/mantrixa-academy`)
2. Update `"homepage"` in `package.json`:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/mantrixa-academy"
   ```
3. Go to **GitHub → Settings → Pages → Source → `gh-pages` branch**
4. Done! The GitHub Actions workflow (`.github/workflows/deploy.yml`) handles everything automatically.

### Auto-deploy triggers:
- ✅ Don't do Direct push to `main`
- ✅ Merging any PR into `main`

---

## 🏗️ Project Structure

```
src/
├── context/
│   ├── AuthContext.js       # Auth state, login, register, enroll
│   └── CourseContext.js     # Courses, exams, notes, reviews
├── data/
│   └── initialData.js       # Seed data: courses, exams, interview Qs
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx           # Also exports ProtectedRoute
│   └── Toast.jsx            # Toast notifications
└── pages/
    ├── Home.jsx             # Landing page with trends
    ├── LearningHub.jsx      # Course listing + detail modal
    ├── Auth.jsx             # Login + Register
    ├── Dashboard.jsx        # Student dashboard + notes viewer
    ├── ExamPanel.jsx        # Timed MCQ exam engine
    ├── InterviewPanel.jsx   # AI chatbot + Google Meet booking
    ├── About.jsx            # Founders + student reviews
    └── AdminPanel.jsx       # Full admin control panel
```

---

## 🎨 Design System

- **Theme:** Dark electric — `#0a0a0f` background, `#00ff88` green accent, `#00d4ff` cyan
- **Fonts:** Syne (headings) + IBM Plex Mono (code/labels) + Outfit (body)
- **State:** React Context + localStorage (no backend required)

---

## ✨ Features

### For Students
- 📚 Browse and enroll in courses
- 📖 View curriculum notes per week
- 📝 Take timed MCQ exams with instant results
- 🎤 AI interview prep chatbot
- 📅 Book live mock interview via email/Google Meet
- ⭐ Leave reviews for instructors

### For Admins
- ➕ Add / edit / delete courses and pricing
- 📋 Create / edit exams with question builder
- 📒 Write and update curriculum notes per week
- 👥 View all student activity and exam results
- 🗑️ Moderate student reviews

---

## 📮 Tech Stack

- **React 18** + React Router v6
- **Context API** for global state
- **localStorage** as persistence layer
- **CSS Variables** design system
- **GitHub Actions** for CI/CD
- **GitHub Pages** for hosting

---

*Built with ❤️ by Bhuvan & Tarun — Mantrixa 2024*

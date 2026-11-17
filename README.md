# LIFE OS — Personal Digital Life & Student Life Operating System

[![CI & Automated Tests](https://github.com/purimetlaakhil99/life-os/actions/workflows/ci.yml/badge.svg)](https://github.com/purimetlaakhil99/life-os/actions)
[![Release](https://img.shields.io/github/v/release/purimetlaakhil99/life-os?color=indigo)](https://github.com/purimetlaakhil99/life-os/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev)

LIFE OS is a comprehensive, privacy-first personal intelligence and academic life operating system. It unifies daily digital routines, task scheduling, communications, attendance intelligence, and university curriculum resources into a single responsive web platform powered by an authorized AI assistant with multilingual voice interaction.

---

## 1. Problem Statement & Overview
Modern individuals and university students juggle fragmented platforms: calendar apps, separate attendance loggers, note-taking systems, exam preparation repositories, and email managers. Crucial dates, birthday communications, and academic margins slip through the cracks. 

**LIFE OS** solves this by providing:
1. **Personal Digital Life**: Centralized daily agenda, Google Calendar events, contacts, recurring bills/subscriptions, and automated birthday email dispatch via official Google OAuth 2.0 Gmail APIs.
2. **Student Life Operating System**: Accurate mathematical attendance margin intelligence (safe bunks and required classes to recover), class timetables, exam countdowns, 12-section structured AI academic notes with PDF export, previous year question paper pattern analysis, and an AI Study Buddy.
3. **Unified Multilingual AI Brain**: A shared conversational context across typing and speaking in English, Hindi (हिन्दी), and Telugu (తెలుగు) with authorized tool execution and sensitive action confirmation.

---

## 2. Primary Navigation Sections
The user dashboard strictly adheres to eight core sections:
1. **Home**: Daily briefing, today's schedule, pending priorities, next upcoming university class, attendance warnings, and birthdays.
2. **AI Assistant**: Unified conversational interface with personal memory retrieval, tool dispatching, and multilingual voice recognition/synthesis.
3. **My Day**: Actionable task manager with priorities, due dates, and recurring intervals.
4. **Planner**: Daily and weekly timeline merging personal events, classes, and deadlines with real-time schedule conflict detection.
5. **Student Life**: Timetables, Attendance Intelligence, 12-section AI Notes, Question Paper Finder, SGPA/CGPA What-If Simulator, Study Buddy, and Career/DSA tracking.
6. **My Memory**: Private, isolated personal knowledge store (preferences, routines, relationships, student facts) with full inspection, editing, and deletion controls.
7. **Goals**: Habit consistency streaks, routines, and target milestones.
8. **Settings**: Google OAuth 2.0 integration, Automatic Birthday Email scheduler, voice preferences, and language toggles.

---

## 3. Technology Stack

- **Frontend**: React.js 18, Vite, Plain Vanilla CSS (CSS variables, modern responsive flexbox & grid design system, Lucide icons, zero Tailwind, zero TypeScript).
- **Backend**: Node.js, Express.js (ESM modules), RESTful API architecture.
- **Database**: MongoDB & Mongoose.
- **Security**: Argon2id password hashing, HTTP-only secure cookie session management, AES-256-GCM symmetric token encryption at rest, Zod input validation schemas, Helmet security headers, Express rate limiting.
- **AI Core**: Centralized AI Brain with tool/function dispatcher, semantic memory retrieval, and sensitive action preview/confirmation.
- **Voice Engine**: Multilingual Web Speech API (SpeechRecognition & SpeechSynthesis) supporting English (`en-US`), Hindi (`hi-IN`), and Telugu (`te-IN`).
- **Integrations**: Official Google OAuth 2.0, Gmail API (`gmail.send`), Web Push API Service Workers.
- **Testing**: Vitest, Supertest.
- **CI/CD**: GitHub Actions.

---

## 4. System Architecture

```
+---------------------------------------------------------------------------------+
|                       LIFE OS Frontend (React + Vite + Plain CSS)               |
|   [Home] [AI Assistant] [My Day] [Planner] [Student] [Memory] [Goals] [Settings]|
+---------------------------------------------------------------------------------+
           |                                                      ^
           | REST / JSON (HttpOnly Cookie Auth)                   | Web Push / Events
           v                                                      |
+---------------------------------------------------------------------------------+
|                        Express.js Backend Engine (Node.js)                      |
|                                                                                 |
|  +--------------------+  +----------------------+  +-------------------------+  |
|  | Auth & Security    |  | Central AI Brain     |  | Durable Job Scheduler   |  |
|  | - Argon2id Hashing |  | - Memory Retrieval   |  | - 15s Polling Worker    |  |
|  | - AES-256-GCM      |  | - Tool Dispatcher    |  | - Idempotency Lock      |  |
|  | - Zod Validators   |  | - Action Preview     |  | - Birthday Recurring    |  |
|  +--------------------+  +----------------------+  +-------------------------+  |
|                                                                                 |
|  +--------------------+  +----------------------+  +-------------------------+  |
|  | Student Engine     |  | Notes & PDF Service  |  | Gmail OAuth2 Service    |  |
|  | - Attendance Math  |  | - 12-Section Notes   |  | - Minimal gmail.send    |  |
|  | - SGPA/CGPA Calc   |  | - PDFKit Streaming   |  | - Base64 MIME Composer  |  |
|  +--------------------+  +----------------------+  +-------------------------+  |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                                 MongoDB Database Tier                           |
|  Users | Tasks | Events | Contacts | Memories | StudentProfiles | Attendance     |
|  AcademicNotes | QuestionPapers | Goals | Subscriptions | ScheduledJobs         |
+---------------------------------------------------------------------------------+
```

---

## 5. Folder Structure

```
life-os/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── sw.js                    # Web Push service worker
│   └── src/
│       ├── App.jsx                  # Main application orchestrator
│       ├── main.jsx
│       ├── index.css                # Plain CSS design system & variables
│       ├── components/
│       │   ├── layout/              # Sidebar (8 sections) & Header
│       │   ├── voice/               # Multilingual Voice Wave visualizer
│       │   └── capture/             # Universal Quick Capture modal
│       ├── pages/
│       │   ├── Home/
│       │   ├── AIAssistant/
│       │   ├── MyDay/
│       │   ├── Planner/
│       │   ├── StudentLife/
│       │   ├── MyMemory/
│       │   ├── Goals/
│       │   ├── Settings/
│       │   └── Auth/
│       ├── context/                 # AuthContext, AIContext, NotificationContext
│       └── utils/                   # api.js, voiceEngine.js
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── app.js                   # Express application setup & middleware
│   │   ├── server.js                # Server entry point & DB connector
│   │   ├── config/                  # Database & environment configurations
│   │   ├── models/                  # 12 Mongoose schema models
│   │   ├── middlewares/             # Auth, RateLimiter, Validation, ErrorHandler
│   │   ├── services/                # AI Brain, Attendance, Notes, Scheduler, Gmail
│   │   ├── controllers/             # REST route controllers
│   │   ├── routes/                  # Express API routers
│   │   └── utils/                   # AES-256 crypto, Zod schemas
│   └── tests/                       # Automated test suites (Vitest & Supertest)
├── .github/
│   └── workflows/
│       └── ci.yml                   # Automated GitHub Actions test pipeline
├── .env.example
├── .gitignore
├── package.json                     # Root package scripts
└── README.md
```

---

## 6. Installation & Local Setup

### Live Demonstration & Public HTTPS URL
- **Production Web Application**: [https://wiki-rob-packages-dial.trycloudflare.com](https://wiki-rob-packages-dial.trycloudflare.com)
- **API Health Check**: [https://wiki-rob-packages-dial.trycloudflare.com/api/health](https://wiki-rob-packages-dial.trycloudflare.com/api/health)
- **GitHub Repository**: [https://github.com/purimetlaakhil99/life-os](https://github.com/purimetlaakhil99/life-os)

### Prerequisites
- Node.js (v20+ or v26 compatible)
- MongoDB instance running locally on `mongodb://localhost:27017` or MongoDB Atlas URI.

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/life-os.git
   cd life-os
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `server/.env` and update secrets:
   ```bash
   cp .env.example server/.env
   ```

3. **Install Dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

4. **Build Frontend**:
   ```bash
   npm run build
   ```

5. **Start Application**:
   - To run both in development:
     ```bash
     npm run dev
     ```
   - Or run production server (serves frontend build directly):
     ```bash
     npm start
     ```
   - Backend API will listen on `http://localhost:5000`
   - Frontend dev server on `http://localhost:5173`

---

## 7. Attendance Margin Mathematical Model

The Attendance Intelligence service calculates exact real-time attendance thresholds:

$$\text{Current Percentage} = \frac{\text{Attended Classes}}{\text{Total Classes}} \times 100$$

1. **When Attendance is Below Target** ($P < T$):
   $$\text{Classes to Reach Target} = \left\lceil \frac{T \times \text{Total} - 100 \times \text{Attended}}{100 - T} \right\rceil$$

2. **When Attendance is Above Target** ($P \ge T$):
   $$\text{Safe Classes to Miss} = \left\lfloor \frac{100 \times \text{Attended} - T \times \text{Total}}{T} \right\rfloor$$

---

## 8. Automatic Birthday Gmail System

The birthday automation pipeline guarantees reliable delivery without manual intervention:
1. User connects Google Account using Google OAuth 2.0 with minimal `gmail.send` scope.
2. The refresh token is encrypted at rest using `AES-256-GCM` with a 32-byte key.
3. User adds contacts with their birthday, language (`en`, `hi`, `te`), style (`heartfelt`, `friendly`, `emotional`, `funny`, `simple`), and scheduled send time (e.g. `09:00`).
4. A durable background scheduler polls MongoDB every 15 seconds.
5. On the birthday morning, the worker locks the job with a unique idempotency key (`bday_<contactId>_<year>`), preventing duplicate messages.
6. The email is formatted as an RFC 2822 base64url MIME payload and dispatched via `gmail.users.messages.send`.
7. Next year's job is automatically queued.

---

## 9. Automated Testing

Run the full backend test suite:
```bash
cd server
npm test
```
All unit and integration tests (GPA calculations, Attendance formulas, Cryptographic security, 12-section Academic Notes, Birthday Worker, and Express routes) execute via Vitest.

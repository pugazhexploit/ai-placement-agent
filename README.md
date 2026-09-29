# CampusHire 🎓
### College Placement Management & Career-Readiness Platform

**CampusHire** is a modern, responsive web application designed for engineering colleges and university placement cells. It seamlessly connects placement operations (company drives, student applications, status pipelines) with daily student career preparation (Quantitative Aptitude, Technical Practice, Critical Thinking drills, and AI-ready Mock Interviews).

---

## 🚀 Key Features

### 👨‍🎓 For Students
- **Smart Placement Dashboard**: Welcome banner, active CGPA check, real-time application count, and category progress bars.
- **Daily 15-Question Challenge**: Mixed assessment (5 Aptitude + 5 Technical + 5 Critical Thinking) to keep placement preparation consistent.
- **Placement Drive Explorer**: Real-time company cards with packages, deadlines, locations, minimum CGPA eligibility checks, and instant one-click apply.
- **Practice Hub**:
  - **Quantitative Aptitude**: Percentages, Profit & Loss, Ratio, Time & Work, Time & Distance, Average, etc.
  - **Technical Practice**: Data Structures, DBMS, Operating Systems, Computer Networks, OOP, React, Python, Java.
  - **Critical Thinking**: Logical Reasoning, Syllogisms, Pattern Recognition, Puzzles, Data Sufficiency.
- **Timed Quiz Engine & Instant Scorecard**: Clean Question X / Y pagination with 4 options, live countdown timer, and in-depth performance analysis with full explanations.
- **Interview Preparation & AI Mock Interview Simulator**:
  - Curated question bank with recommended answering structures (STAR framework).
  - Role-specific mock interview flow with heuristic evaluation, performance scoring, strengths, and targeted improvement feedback.
- **Student Profile Management**: Manage verified skills tags, academic CGPA, department, and resume links.

### 👩‍🏫 For Placement Officers (Staff/Admin)
- **Placement Command Center**: Key KPIs (Total Students, Eligible Candidates, Active Drives, Placed Students).
- **Interactive Recharts Visualizations**:
  - Applications volume breakdown by company.
  - Department-wise candidate distribution.
  - Overall student readiness radar across preparation categories.
- **Student Directory**: Candidate directory with department filters and eligibility status checks.
- **Placement Drive Creator**: Publish new campus drives with compensation packages, deadlines, and eligibility criteria.
- **Applicant Status Pipeline**: Track and advance student applications across `Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Selected` ➔ `Rejected`.
- **Question Bank CRUD**: Add, categorize, filter, and delete practice questions across any category or topic.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + Vite + TypeScript |
| **Styling** | Tailwind CSS (Cyan/Blue modern dark/light dashboard theme) |
| **Icons** | Lucide React |
| **Data Visualizations** | Recharts |
| **Database & Backend** | Supabase (PostgreSQL) with Row Level Security (RLS) |
| **Authentication** | Supabase Auth (with instant One-Click Demo Mode) |
| **AI Integration** | Modular `aiService.ts` proxy architecture ready for Gemini API |

---

## ⚡ Quick Start

### 1. Run Locally
```bash
# Clone or navigate to the project directory
cd swfitfinal

# Install dependencies (if not already installed)
npm install

# Start local development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Dual-Mode Evaluation (Zero-Setup Demo)
CampusHire includes an intelligent **Demo Mode** with realistic seed data preloaded into LocalStorage.
- You can switch between **Student** and **Staff / Placement Officer** roles with one click in the top navigation bar or login screen.
- All actions (applying to drives, taking quizzes, adding questions, creating drives, mock interviews) persist locally in your browser.

### 3. Connect to Live Supabase (Optional)
To connect to your own Supabase project:
1. Open your Supabase SQL Editor and execute the script in `supabase/schema.sql`.
2. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
3. Restart the dev server (`npm run dev`). CampusHire will automatically detect the live keys and synchronize with your PostgreSQL database!

---

## 📁 Project Structure

```
swfitfinal/
├── supabase/
│   └── schema.sql                  # Full PostgreSQL DDL, 8 tables, RLS policies & seed data
├── src/
│   ├── types/
│   │   └── index.ts                # TypeScript data interfaces
│   ├── context/
│   │   ├── AuthContext.tsx         # Supabase Auth + Role switching
│   │   └── ThemeContext.tsx        # Dark/Light mode theme state
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client + fallback detector
│   │   └── mockData.ts             # Preloaded dataset for immediate demonstration
│   ├── services/
│   │   ├── placementService.ts     # Drives, companies & applications
│   │   ├── questionService.ts      # Question bank & quiz evaluations
│   │   ├── profileService.ts       # Candidate profiles
│   │   └── aiService.ts            # AI mock interview scoring logic
│   ├── components/
│   │   ├── common/                 # Navbar, Sidebar, StatCard, Badge, Modal, LoadingState
│   │   └── student/                # WelcomeCard, DriveCard, ProgressOverview, DailyChallengeModal
│   └── pages/
│       ├── auth/                   # Login & Student Register
│       ├── student/                # Dashboard, Profile, Drives, Companies, Practice, Quiz, Interview
│       └── staff/                  # Dashboard, Directory, Manage Drives, Applications, Question Bank
```

---

## 🧪 Verification & Build
```bash
npm run build
```
Creates an optimized production bundle in `/dist`.

- **** — Daily commit #687

- **2026-09-27 18:58** — Daily commit #711

- **2026-09-27 18:58** — Daily push #1

- **2026-09-27 18:58** — Daily push #2

- **2026-09-27 18:59** — Daily push #3

- **2026-09-27 19:05** — Daily push #4

- **2026-09-27 19:05** — Daily push #5

- **2026-09-27 19:06** — Daily push #6

- **2026-09-27 19:06** — Daily push #7

- **2026-09-27 19:06** — Daily push #8

- **2026-09-27 19:06** — Daily push #9

- **2026-09-27 19:06** — Daily push #10

- **2026-09-27 19:06** — Daily push #11

- **2026-09-27 19:06** — Daily push #12

- **2026-09-27 19:07** — Daily push #13

- **2026-09-27 19:07** — Daily push #14

- **2026-09-27 19:07** — Daily push #15

- **2026-09-27 19:07** — Daily push #16

- **2026-09-27 19:07** — Daily push #17

- **2026-09-27 19:07** — Daily push #18

- **2026-09-27 19:07** — Daily push #19

- **2026-09-27 19:07** — Daily push #20

- **2026-09-29 18:12** — Daily push #1

- **2026-09-29 18:15** — Daily push #2

# IdeaVault ✦ Small Ideas ✦ Big Innovations

IdeaVault is a clean, modern web application designed for students and faculty. Students type in proposed project ideas, and IdeaVault compares them against completed, faculty-approved projects using a custom TF-IDF & Cosine Similarity engine (written from scratch with zero external ML dependencies). It provides similarity scores, top matching project breakdowns, shared keywords, and actionable suggestions to elevate project novelty and rigor.

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your machine:
```bash
node -v
npm -v
```

### 2. Install Dependencies
Install dependencies for both backend and frontend:

```bash
# In the root directory (or respective subdirectories):
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Seed Demo Data
Populate the SQLite database (`ideaVault.db`) with demo accounts and 10 realistic approved projects:

```bash
# Run from root:
npm run seed

# Or run from inside server directory:
cd server && npm run seed
```

> **Note:** The database is never seeded automatically on boot, ensuring data safety.

### 4. Start the Application

Open two terminal windows:

#### Terminal 1 — Backend (Port 5000):
```bash
npm run server
# or: cd server && npm start
```

#### Terminal 2 — Frontend (Port 5173):
```bash
npm run client
# or: cd client && npm run dev
```

Open your browser and visit: **`http://localhost:5173`**

---

## 🔑 Demo Accounts

All demo accounts use the password: `password123`

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **🎓 Student** | `student@ideavault.edu` | `password123` | Submit ideas, save drafts, run TF-IDF analysis, view analysis history, browse approved projects |
| **🏛️ Faculty** | `faculty@ideavault.edu` | `password123` | Review pending student submissions (Approve/Reject), add completed projects to repository |
| **⚡ Admin** | `admin@ideavault.edu` | `password123` | User account management, role assignment, project review, student submission oversight |

*(The login screen also includes convenient **One-Click Auto Fill** buttons for all three roles).*

---

## 🧪 Running Automated Tests

IdeaVault includes unit, integration, and security tests running via Node's native test runner (`node:test`):

```bash
# Run from root:
npm test

# Or run from inside server directory:
cd server && npm test
```

### Test Coverage Summary:
- **`similarity.test.js`**: Text preprocessing, stop word removal, TF-IDF weights, Cosine Similarity math, identical/orthogonal vectors, and suggestions generator.
- **`auth.test.js`**: Login authentication, bcrypt hash comparison, httpOnly JWT cookies, invalid credentials, and session validation.
- **`permissions.test.js`**: Server-side role enforcement (verifies that students are strictly blocked from approving projects or accessing admin routes).
- **`e2e_flow.test.js`**: Complete simulation of student idea submission, similarity evaluation, history retrieval, faculty approval, and catalog search.

**Result**: 28 / 28 tests passing (100% pass rate).

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express (Vanilla JavaScript)
- **Database**: SQLite (via `better-sqlite3`) with schema migrations in `schema.sql`
- **Authentication**: Email + Password, bcrypt password hashing, JWT stored in `httpOnly` cookies
- **Similarity Engine**: Custom TF-IDF vectorization and Cosine Similarity (`similarity.js`, zero ML libraries)
- **Design System**: Dark theme (`#0B1020` background, `#151C30` cards, `#8B5CF6` violet, `#42D6E8` cyan, `#E8ECF5` text, glassmorphic panels, and animated glowing butterflies)

---

## 📁 Repository Structure

```
ideaVault/
├── package.json              # Root commands (seed, test, server, client)
├── .env.example              # Environment variables template
├── .env                      # Local development environment file
├── README.md                 # Project documentation
├── server/
│   ├── db/
│   │   ├── schema.sql        # Database schema (users, projects, ideas, analyses)
│   │   ├── index.js          # better-sqlite3 connection and table initialization
│   │   └── seed.js           # Demo database seeder (npm run seed)
│   ├── src/
│   │   ├── config.js         # Configuration loader
│   │   ├── similarity.js     # Custom TF-IDF & Cosine Similarity engine
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT & Role authorization middleware
│   │   ├── routes/
│   │   │   ├── auth.js       # Login, Logout, Session verification
│   │   │   ├── ideas.js      # Student ideas, drafts, and similarity analysis
│   │   │   ├── projects.js   # Project catalog and faculty review
│   │   │   └── users.js      # Admin user management
│   │   ├── app.js            # Express application setup & CORS
│   │   └── server.js         # Server listener
│   └── tests/                # 28 passing unit & integration tests
│       ├── similarity.test.js
│       ├── auth.test.js
│       ├── permissions.test.js
│       └── e2e_flow.test.js
└── client/
    ├── index.html            # Entry HTML with modern typography & SEO tags
    ├── src/
    │   ├── api.js            # Centralized API client with cookie credentials
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth session provider
    │   ├── components/       # Glowing butterflies, Sidebar, Project modal, Loaders
    │   └── pages/
    │       ├── LoginPage.jsx # Night-sky login with animated butterflies
    │       ├── StudentDashboard.jsx # Idea box, drafts, past analyses
    │       ├── IdeaAnalysisPage.jsx # Similarity score gauge, matches, suggestions
    │       ├── ApprovedProjectsPage.jsx # Catalog with search & filters
    │       ├── FacultyProjectsPage.jsx  # Review queue & Add project form
    │       └── AdminUsersPage.jsx       # User administration directory
```

---

## 🛡️ Key Features & Security

1. **Pure JS Similarity Engine**: Calculates term frequency, inverse document frequency across the corpus, and cosine vector distances with high accuracy.
2. **Actionable Suggestions**: Provides dynamic 2-3 step recommendations (Differentiation, Architecture, and Measurable Outcomes) for every analyzed idea.
3. **Plagiarism & Advisory Disclaimer**: Clearly communicates that similarity scores represent topical overlap against historical records and do not prove plagiarism.
4. **Strict Server-Side Role Protection**: Role verification is enforced on all endpoints; students cannot approve projects even if attempting direct API calls.
5. **Parameterized SQL Queries**: All database interactions use parameterized queries via `better-sqlite3` to prevent SQL injection.

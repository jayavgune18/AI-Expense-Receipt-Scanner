# 🧾 AI Expense Receipt Scanner - Full-Stack Application

A production-ready **AI-powered Expense Receipt Scanner** built with React.js, Node.js, Express, MongoDB Atlas, Tesseract.js OCR, OpenAI GPT-4, and Cloudinary. Automatically digitize receipts, extract expense data, categorize spending, detect anomalies, and secure backup to the cloud.

## 🚀 Features

### Core Features
- **User Authentication** — JWT + bcrypt, register/login, password reset, profile management
- **Receipt Upload** — Drag-and-drop or file upload, image preview, multiple file support
- **OCR Processing** — Tesseract.js extracts merchant name, date, total, tax, items, receipt number
- **AI Categorization** — OpenAI GPT-4 classifies expenses into 9 categories with confidence scoring
- **Expense Dashboard** — Monthly spending, category breakdown, trends, top merchants, interactive charts
- **Smart Search** — Search by merchant, category, date range, amount filters
- **Cloud Backup** — Cloudinary storage for receipt images, backup history, multi-device sync
- **AI Insights** — Spending analysis, budget suggestions, savings tips, anomaly detection
- **Report Generation** — PDF & Excel export with monthly summaries and category breakdowns
- **Notifications** — In-app & email alerts for processing status, budget warnings, backup completion

### Advanced Features
- **AI Financial Chatbot** — Ask questions about your spending, get personalized advice
- **Duplicate Detection** — Auto-detect duplicate receipts by merchant + amount + date
- **Fraud Detection** — Identify suspicious transactions and unusually high amounts
- **Multi-Currency Support** — USD, EUR, GBP, INR, JPY, CAD, AUD
- **Dark/Light Mode** — System-aware with manual toggle, persisted
- **PWA Support** — Installable, offline-capable progressive web app
- **Admin Dashboard** — System stats, user management, platform monitoring

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS, Redux Toolkit, Framer Motion, Recharts, react-hot-toast, Lucide Icons |
| **Backend** | Node.js, Express.js, Mongoose ODM, JWT, bcryptjs |
| **Database** | MongoDB Atlas |
| **OCR** | Tesseract.js |
| **AI** | OpenAI GPT-4 (extraction, categorization, insights, chatbot) |
| **Storage** | Cloudinary (image upload, optimization, backup) |
| **Charts** | Recharts (Area, Pie, Bar, Line charts) |
| **Deployment** | Vercel (frontend), Render (backend), Docker |

## 📁 Project Structure

```
expense-scanner/
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── config/             # Database, env, cloudinary, openai config
│   │   ├── models/             # Mongoose schemas (8 collections)
│   │   ├── routes/             # Express route handlers (8 modules)
│   │   ├── controllers/        # Business logic controllers
│   │   ├── services/           # Core services (auth, ocr, ai, storage, email, report, duplicate)
│   │   ├── middleware/         # Auth, admin, upload, validation, error handling, rate limiting
│   │   └── utils/              # Logger, helpers
│   ├── server.js               # Entry point
│   └── package.json
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/                # Axios client + API modules
│   │   ├── components/         # Reusable UI components (common, layout, auth, feature-specific)
│   │   ├── pages/              # 14 page components
│   │   ├── store/              # Redux Toolkit store + slices
│   │   ├── utils/              # Constants, formatters
│   │   └── styles/             # Tailwind CSS with custom components
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker/                     # Docker configuration
│   ├── Dockerfile.backend
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register           # Create account
POST   /api/auth/login              # Sign in
POST   /api/auth/logout             # Sign out
POST   /api/auth/refresh-token      # Refresh JWT
POST   /api/auth/forgot-password    # Send reset email
POST   /api/auth/reset-password/:token  # Reset password
GET    /api/auth/me                 # Get profile
PUT    /api/auth/me                 # Update profile
PUT    /api/auth/change-password    # Change password
```

### Receipts
```
POST   /api/receipts/upload         # Upload receipt image
GET    /api/receipts                # List with search/filter/pagination
GET    /api/receipts/stats          # Receipt statistics
GET    /api/receipts/:id            # Get single receipt
PUT    /api/receipts/:id            # Update receipt data
DELETE /api/receipts/:id            # Delete receipt
POST   /api/receipts/:id/reprocess  # Re-run OCR + AI
```

### Expenses
```
GET    /api/expenses                # List with search/filter
GET    /api/expenses/stats          # Aggregate stats
GET    /api/expenses/:id            # Get expense
POST   /api/expenses                # Create expense
PUT    /api/expenses/:id            # Update expense
DELETE /api/expenses/:id            # Delete expense
```

### Insights
```
GET    /api/insights                # AI-generated insights
GET    /api/insights/spending-habits  # Spending pattern analysis
GET    /api/insights/budget-suggestions # Budget recommendations
GET    /api/insights/anomalies      # Anomaly detection
GET    /api/insights/savings        # Savings recommendations
POST   /api/insights/chat           # AI chatbot
GET    /api/insights/chat/history   # Chat history
```

### Reports, Backup, Notifications, Admin
```
POST   /api/reports/generate        # Generate PDF/Excel
GET    /api/reports                  # Report history
POST   /api/backup                  # Trigger backup
GET    /api/backup                  # Backup history
GET    /api/notifications           # Get notifications
PUT    /api/notifications/read-all  # Mark all as read
GET    /api/admin/stats             # System stats (admin)
GET    /api/admin/users             # User management (admin)
```

## 🗄️ Database Collections

1. **Users** — Auth, profiles, preferences, notification settings
2. **Receipts** — OCR text, extracted data, AI classification, duplicate/fraud flags
3. **Expenses** — Transaction data, categories, merchant info, links to receipts
4. **Categories** — Pre-seeded default categories with AI keywords
5. **Reports** — Generated report history, stored data
6. **Notifications** — In-app alerts with TTL index (30-day auto-delete)
7. **Backups** — Cloud backup tracking
8. **ChatMessages** — AI chatbot conversation history

## 🚦 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (free tier)
- OpenAI API key

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd expense-scanner

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment
```bash
# Backend (backend/.env)
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/expense-scanner
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPENAI_API_KEY=your-openai-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### 3. Run Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Open http://localhost:5173 — the app is ready!

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Or build manually:
docker build -f docker/Dockerfile.backend -t expense-scanner-backend .
docker run -p 5000:5000 --env-file backend/.env expense-scanner-backend
```

## 🚀 Production Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
vercel --prod
```

### Backend → Render
1. Push to GitHub
2. Create new Web Service on Render
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables from `.env`

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend build check
cd frontend && npm run build
```

## 📊 Key Architecture Decisions

- **Redux Toolkit** for predictable state management with async thunks
- **Framer Motion** for smooth page transitions and micro-interactions
- **Tesseract.js** for client-side OCR (free, no API costs)
- **OpenAI GPT-4** for intelligent receipt parsing and financial insights
- **Cloudinary** for optimized image delivery and automatic backup
- **JWT + httpOnly cookies** for secure authentication with refresh token rotation
- **Winston** for structured server logging
- **Helmet + CORS + Rate Limiting** for security

## 🔒 Security Features

- Bcrypt password hashing (12 rounds)
- JWT access (15min) + refresh (7d) token rotation
- HTTP-only cookies for refresh tokens
- Input validation on all endpoints (express-validator)
- File upload validation (type, size limits)
- Rate limiting on auth endpoints
- Helmet security headers
- CORS restricted to frontend domain

## 📝 License

MIT

---

Built with ❤️ using React, Node.js, AI & Cloud Technologies
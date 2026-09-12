# 🧾 ScanExpense — AI Expense & Receipt Scanner

<p align="left">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
</p>

A full-stack, production-ready AI-powered expense and receipt management application built with the MERN stack. Features intelligent OCR scanning, AI-driven expense categorization, interactive dashboards, cloud backup, fraud detection, and multi-format reporting.

Designed for individuals and small businesses to digitize, organize, and gain insights from financial receipts and expenses — ideal for final-year projects, placement portfolios, and technical showcases.

---

## 📚 Table of Contents

- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [API Overview](#-api-overview)
- [Security Architecture](#-security-architecture)
- [Docker Support](#-docker-support)
- [Contact](#-contact)

---

## 🌐 Live Demo

Check out the live application: [🔗 ScanExpense](https://expense-scanner-frontend.onrender.com)

---

## 🚀 Key Features

### 1. **Smart Receipt Scanning & OCR**
- Upload receipt images via drag-and-drop file upload (powered by `react-dropzone`).
- Automatic text extraction using **Tesseract.js** OCR engine with **image preprocessing** (grayscale, normalize, sharpen via Sharp).
- Extracted data parsed and structured into expense records with merchant name, date, amounts, line items, and tax.
- Fallback extraction logic when OCR confidence is low.

### 2. **AI-Powered Receipt Parsing**
- Integrates with **OpenAI GPT-4** to intelligently parse raw OCR text into structured receipt data.
- Extracts merchant name, date, total/subtotal/tax amounts, receipt number, currency, line items, and category.
- Smart category assignment from 9 predefined categories (Food & Dining, Transport, Shopping, Healthcare, Education, Entertainment, Travel, Utilities, Others).
- Fallback regex-based extraction when AI is unavailable.

### 3. **AI Financial Insights & Advisor**
- **GPT-4 powered insights engine** analyzes your spending patterns and generates personalized financial advice.
- Insights categorized by type: **saving tips**, **warnings**, **budget recommendations**, and **general insights**.
- Each insight includes a priority level (high/medium/low) for actionable decision-making.
- **AI Chatbot Assistant** — conversational interface to ask questions about your finances, get spending summaries, and receive personalized advice.

### 4. **Anomaly & Fraud Detection**
- **Statistical anomaly detection**: Flags transactions that exceed 3x the category average (Z-score based).
- Severity classification: **high** (>5x average) and **medium** (>3x average) severity levels.
- **Duplicate receipt detection**: Identifies receipts with same merchant and similar amounts within a 3-day window.
- **Fraud scoring**: Detects 3+ identical receipts within 24 hours and flags amounts over $10,000.
- Real-time fraud assessment during receipt upload with confidence scoring.

### 5. **Interactive Dashboard & Analytics**
- Real-time spending summaries with **Recharts** visualizations (bar, pie, line, and area charts).
- Monthly/yearly spending trends and category breakdowns with color-coded categories.
- Key metrics: total expenses, monthly spending, average transaction value, receipt count.
- Responsive stat cards with animated counters and skeleton loading states.

### 6. **Expense Management**
- Full CRUD operations on expenses with search, filter (by category), and sort (by date/amount).
- Manual expense entry for non-receipt transactions.
- Paginated listing with 50 items per page.
- Total spending summary with formatted currency display.

### 7. **Budget Management**
- Set and track monthly budgets by category.
- Visual progress indicators showing spending vs. budget limits.
- Budget alerts and overspend warnings.

### 8. **Reports & Export**
- Generate **PDF reports** using PDFKit with professional formatting and branding.
- Export multi-sheet **Excel reports** via ExcelJS for bookkeeping.
- Downloadable reports with unique filenames and timestamps.
- Report history with download management.

### 9. **Cloud Backup & Restore**
- One-click backup of all receipts, expenses, and user data.
- **Cloudinary** integration for receipt image storage with secure uploads.
- Full restore capability from any backup point.
- Backup history with timestamps and status tracking.
- **Automated cron-based backup scheduling** via node-cron.

### 10. **Admin Panel**
- User management dashboard with role-based access (Admin/User).
- System-wide statistics: total users, receipts, expenses, storage usage.
- User account management (view, delete).
- Backup oversight and restore operations.

### 11. **Security & Authentication**
- **JWT-based authentication** with dual-token system: short-lived access tokens (15 min) + refresh tokens (7 days) with rotation.
- **Password reset flow**: Forgot password → email with reset link → secure token-based reset.
- bcrypt password hashing with salt rounds.
- Rate limiting: API-wide (100 req/15 min) + upload-specific (20 uploads/5 min).
- Helmet security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.).
- CORS with strict origin whitelist.
- Input validation and sanitization via express-validator.
- Centralized error handler preventing information leakage.

### 12. **Email Notification System**
- Transactional emails: welcome messages, password reset links, backup confirmations.
- Configurable SMTP provider (Gmail, SendGrid, etc.).
- HTML email templates with responsive design.
- Notification preferences and in-app notification center.

### 13. **Dark/Light Theme**
- Full dark mode support with persistent theme selection via Redux.
- Smooth theme transitions with Framer Motion animations.
- System preference detection for initial theme.

### 14. **Responsive UI & Animations**
- Built with **Tailwind CSS** for fully responsive design across desktop, tablet, and mobile.
- **Framer Motion** page transitions, staggered list animations, and micro-interactions.
- Glass-morphism card designs with hover effects.
- Skeleton loading states for all data-fetching views.

### 15. **Image Processing Pipeline**
- Receipt image preprocessing with **Sharp**: grayscale conversion, normalization, and sharpening for improved OCR accuracy.
- Multiple upload support with file type and size validation (10MB limit).
- Local filesystem + Cloudinary dual storage strategy.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Redux Toolkit, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, Socket.IO, Winston Logger |
| **Database** | MongoDB + Mongoose (with indexed schemas) |
| **OCR** | Tesseract.js |
| **AI/ML** | OpenAI GPT-4 API |
| **Storage** | Cloudinary (images), Local filesystem (uploads) |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Email** | Nodemailer (SMTP) |
| **Reports** | PDFKit, ExcelJS |
| **Containerization** | Docker + Docker Compose |
| **Scheduling** | node-cron |

---

## 📁 Project Structure

```text
expense-scanner/
├── backend/
│   ├── config/              # DB, Cloudinary, OpenAI, env config
│   ├── controllers/         # Express route handlers (auth, receipts, expenses, reports, etc.)
│   ├── middleware/           # JWT auth, admin guard, upload, rate limiter, validation, error handler
│   ├── models/              # Mongoose schemas (User, Receipt, Expense, Category, Report, etc.)
│   ├── routes/              # RESTful API route definitions
│   ├── services/            # Business logic (AI, OCR, email, storage, reports, duplicates)
│   ├── templates/           # Email and report templates
│   ├── utils/               # Helpers and logger
│   ├── uploads/             # Local file uploads directory
│   ├── public/              # Static assets and placeholder images
│   ├── jobs/                # Cron jobs (backup scheduling)
│   ├── scripts/             # Utility scripts
│   ├── server.js            # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client and auth helpers
│   │   ├── components/      # Reusable UI components (layouts, common, auth)
│   │   ├── pages/           # Route pages (Landing, Login, Dashboard, Receipts, etc.)
│   │   ├── store/           # Redux Toolkit slices (auth, theme, expenses, receipts)
│   │   └── utils/           # Formatters & helpers
│   ├── public/images/       # App screenshots
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── docker/
│   ├── Dockerfile.backend
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── render.yaml
└── README.md
```

---

## 📸 Screenshots

### 🔐 Authentication
| Login | Register |
|:----:|:----:|
| ![Login](frontend/public/images/Login.png) | ![Register](frontend/public/images/Register.png) |

### 📊 Dashboard
| Dashboard Overview |
|:----:|
| ![Dashboard](frontend/public/images/Dashboard.png) |

### 📁 Receipt & Expense Management
| Receipt Upload | Reconciliation Workbench |
|:----:|:----:|
| ![UploadFile](frontend/public/images/UploadFile.png) | ![Reconciliation Workbench](frontend/public/images/ReconciliationWorkbench.png) |

### 🚨 Fraud Detection & Audit
| Fraud Alerts | Audit Logs |
|:----:|:----:|
| ![FraudAlerts](frontend/public/images/FraudAlerts.png) | ![Audit Logs](frontend/public/images/AuditLogs.png) |

### ⚙️ Settings
| Profile | Storage | Password |
|:----:|:----:|:----:|
| ![SettingsProfile](frontend/public/images/SettingsProfile.png) | ![SettingsStorage](frontend/public/images/SettingsStorage.png) | ![SettingsPassword](frontend/public/images/SettingsPassword.png) |

| Devices & Sessions | Account Options |
|:----:|:----:|
| ![SettingsDevicesAndSessions](frontend/public/images/SettingsDevicesAndSessions.png) | ![SettingsAccountOptions](frontend/public/images/SettingsAccountOptions.png) |

---

## 🏃 Getting Started & Local Setup

### **Prerequisites**
- **Node.js** v18 or higher
- **MongoDB** (local instance or MongoDB Atlas connection string)
- **Cloudinary** account (for image uploads)
- **OpenAI API key** (for AI categorization)

### **Step 1: Clone & Install Dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **Step 2: Environment Configuration**

Copy the example environment file and configure your variables:

```bash
cp .env.example backend/.env
```

```ini
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/expense-scanner

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary (for receipt image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (for AI categorization)
OPENAI_API_KEY=your-openai-api-key

# SMTP (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@expensescanner.com

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

### **Step 3: Start the Backend Server**

```bash
cd backend
npm run dev
```

The API server starts at `http://localhost:5000`.

### **Step 4: Start the Frontend Client**

```bash
cd frontend
npm run dev
```

The Vite dev server starts at `http://localhost:5173`.

### **Step 5: Access the Application**

Open your browser and navigate to **`http://localhost:5173`**.

---

## 📡 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | | |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password/:token` | Reset password with token |
| GET | `/api/auth/profile` | Get current user profile |
| **Receipts** | | |
| POST | `/api/receipts/upload` | Upload receipt image(s) |
| GET | `/api/receipts` | List all receipts (paginated) |
| GET | `/api/receipts/:id` | Get single receipt details |
| DELETE | `/api/receipts/:id` | Delete a receipt |
| **Expenses** | | |
| GET | `/api/expenses` | List expenses (filtered, paginated) |
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses/stats` | Get spending statistics and charts data |
| GET | `/api/expenses/:id` | Get single expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| **Insights** | | |
| GET | `/api/insights` | Get AI-powered spending insights |
| **Reports** | | |
| POST | `/api/reports/generate` | Generate PDF or Excel report |
| GET | `/api/reports` | List generated reports |
| GET | `/api/reports/download/:id` | Download a report file |
| **Backup** | | |
| POST | `/api/backup` | Create a new backup |
| GET | `/api/backup` | List all backups |
| POST | `/api/backup/restore/:id` | Restore from a backup |
| DELETE | `/api/backup/:id` | Delete a backup |
| **Notifications** | | |
| GET | `/api/notifications` | List user notifications |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| **Admin** | | |
| GET | `/api/admin/users` | List all users (admin only) |
| GET | `/api/admin/stats` | Get system statistics (admin only) |
| DELETE | `/api/admin/users/:id` | Delete user (admin only) |
| **Health** | | |
| GET | `/api/health` | Health check endpoint |

---

## 🔒 Security Architecture

1. **JWT Token Authentication**: Short-lived access tokens (15 min) with refresh token rotation (7 days). Tokens are sent via secure HTTP-only cookies or Authorization headers.

2. **Rate Limiting**: API-wide rate limiting (100 requests per 15 min per IP) and upload-specific limits (20 uploads per 5 min).

3. **Input Validation**: All request bodies validated using `express-validator` with sanitization to prevent NoSQL injection.

4. **Security Headers**: `Helmet` middleware configures 15+ HTTP security headers (CSP, HSTS, X-Frame-Options, etc.).

5. **CORS Protection**: Strict origin whitelist allowing only configured frontend/backend URLs.

6. **Password Security**: bcrypt hashing with salt rounds; password reset flow with expiring tokens.

7. **File Upload Safety**: File type validation, size limits (10MB), and Cloudinary virus scanning integration.

8. **Error Handling**: Centralized error handler prevents information leakage in production.

---

## 🐳 Docker Support

### Development
```bash
docker-compose up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up
```

---

## 📬 Contact

Feel free to reach out:

- **LinkedIn**: [Jay Avgune](https://www.linkedin.com/in/jay-avgune-1316b323a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)
- **GitHub**: [jayavgune18](https://github.com/jayavgune18)

---

<div align="center">
  <strong>Made with ❤️ by Jay Avgune</strong>
</div>
# 📚 WorkDiary AI

> **Transform your internship logs into powerful insights with AI-driven automation**

WorkDiary AI is an intelligent internship tracking and reporting platform that leverages AI to automatically summarize your daily activities, detect skills, generate professional reports, and provide valuable analytics—all with minimal effort.

## ✨ Features

- **🤖 AI-Powered Summarization** - Let our AI transform rough notes into polished professional entries
- **📊 Smart Analytics** - Track hours, detect skills, and visualize your growth over time
- **📑 Auto-Generated Reports** - Create weekly, monthly, or final internship reports in seconds
- **⏱️ Time Tracking** - Effortlessly log hours spent on different projects and tasks
- **💾 Secure Storage** - Your data is encrypted and stored securely with PostgreSQL + Supabase
- **🎯 Skill Detection** - AI automatically identifies and categorizes technical and soft skills
- **📱 Multi-Platform** - Access from web, desktop, or mobile (React Native)

## 🏗️ Architecture

WorkDiary AI is a **full-stack monorepo** built with modern technologies:

```
work-diary-ai/
├── frontend/          # Next.js 16 + React 19 + TypeScript
├── backend/           # NestJS + TypeScript + PostgreSQL
├── mobile/            # React Native (Expo)
└── docker-compose.yml # Local development setup
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16.2.6, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS 11, TypeScript, Prisma ORM, PostgreSQL |
| **Mobile** | React Native (Expo), TypeScript |
| **Database** | PostgreSQL (Supabase) with Prisma adapter |
| **Authentication** | Custom JWT-based auth with pbkdf2 password hashing |
| **Deployment** | Docker, Docker Compose |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Supabase account)
- Docker & Docker Compose (optional)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/tharanijayathura/work-diary-ai.git
   cd work-diary-ai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your DATABASE_URL (Supabase PostgreSQL)
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   npm run dev
   # Runs on http://localhost:3001/api
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with NEXT_PUBLIC_API_URL=http://localhost:3001
   npm run dev
   # Runs on http://localhost:3000
   ```

4. **Mobile Setup** (optional)
   ```bash
   cd mobile
   npm install
   npm start
   # Scan QR code with Expo Go app
   ```

### Default Test Credentials

After seeding the database, you can log in with:
- **Email**: `john.doe@example.com`
- **Password**: `Demo1234!`

Or sign up with a new account via the frontend.

## 📖 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "jordan@example.com",
    "name": "Jordan Lee"
  }
}
```

#### POST `/api/auth/login`
Authenticate and receive session credentials.

**Request:**
```json
{
  "email": "jordan@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "jordan@example.com",
    "name": "Jordan Lee"
  }
}
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── diary/             # Daily diary entries
│   ├── internships/        # Internship management
│   ├── reports/           # Report generation
│   ├── ai/                # AI integration
│   └── prisma/            # ORM module
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
└── package.json

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/        # Login & signup pages
│   │   └── (dashboard)/   # Dashboard & workspace
│   ├── components/
│   │   ├── auth/          # Auth forms
│   │   └── ui/            # Reusable UI primitives
│   ├── lib/               # Utilities & helpers
│   └── store/             # Zustand state management
└── package.json

mobile/
├── app/
│   ├── (auth)/
│   └── (tabs)/
├── components/
└── package.json
```

## 🔐 Security

- Passwords are hashed using **pbkdf2** with random salts
- Sensitive files (`.env`, `.env.local`) are excluded via `.gitignore`
- Database credentials are environment-variable based
- API endpoints validate input and authenticate requests
- No sensitive data is logged or stored client-side

## 🤝 Contributing

Contributions are welcome! Please:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes with clear messages: `git commit -m "feat: add feature"`
3. Push and open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

- [ ] JWT token-based authentication with refresh tokens
- [ ] OAuth integration (GitHub, Google)
- [ ] Email verification and password reset
- [ ] Real AI summarization with OpenAI/Claude API
- [ ] Advanced analytics dashboard
- [ ] Export reports as PDF/DOCX
- [ ] Collaboration features (team workspaces)
- [ ] Mobile app iOS/Android builds

## 💬 Support

Have questions or found a bug? Please open an [issue](https://github.com/tharanijayathura/work-diary-ai/issues) on GitHub.

## 👨‍💻 Author

**Tharani Jayathura** - [@tharanijayathura](https://github.com/tharanijayathura)

---

**Built with ❤️ for interns, by interns**

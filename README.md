# Quran Discipline Academy

> "Discipline Transforms. Consistency Wins."

A comprehensive online education platform for Quran teaching and Islamic studies. Built as a multi-portal SaaS application with dedicated interfaces for administrators, teachers, and students.

## Project Overview

**Domain:** [qurandiscipline.academy](https://qurandiscipline.academy)
**Type:** Multi-Portal SaaS Web Application
**Industry:** Online Education — Islamic Studies & Quran Teaching

## Features

- **Multi-Role Portal System**
  - Admin Portal - Complete management dashboard
  - Teacher Portal - Schedule management, student progress tracking, assessments
  - Student Portal - Courses, sessions, homework, progress tracking
  - Public Landing Page - Booking and information

- **Core Capabilities**
  - User authentication with JWT (access + refresh token rotation)
  - Real-time chat between users
  - Video session scheduling (Zoom integration)
  - Assessment creation and grading
  - Progress tracking and certificates
  - Payment processing via PayPal
  - Email notifications

## Tech Stack

### Backend
- **Framework:** NestJS 10.x (TypeScript)
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Cache:** Redis 7.x
- **Auth:** JWT with Passport
- **Real-time:** Socket.io
- **Email:** Nodemailer (Handlebars templates)
- **Payments:** PayPal REST SDK
- **File Storage:** Cloudinary / AWS S3

### Frontend
- **Framework:** React 18.x (Vite)
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 3.x
- **State:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v6
- **Real-time:** Socket.io-client

## Project Structure

```
quran-discipline-academy/
├── backend/                 # NestJS API
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── teachers/       # Teacher profiles
│   │   ├── students/       # Student profiles
│   │   ├── courses/        # Course catalog
│   │   ├── sessions/       # Session scheduling
│   │   ├── chat/           # Real-time messaging
│   │   └── ...
│   └── test/               # Backend tests
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── features/       # Feature-first organization
│   │   ├── components/     # Shared UI components
│   │   ├── lib/            # Utilities (axios, socket)
│   │   └── store/          # Zustand stores
│   └── test/               # Frontend tests
│
├── docker-compose.yml      # Local dev infrastructure
├── .env.example           # Environment variables template
└── CLAUDE.md              # Project documentation
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional, for infrastructure)

### 1. Clone the Repository

```bash
git clone https://github.com/quranDiscipline/Quran_Discipline.git
cd Quran_Discipline
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

Edit the files with your actual values (see `.env.example` for all required variables).

### 3. Start Infrastructure

```bash
docker-compose up -d
```

### 4. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Backend runs on `http://localhost:3000`

API Documentation: `http://localhost:3000/api/docs`

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Default Admin Credentials

After seeding the database:

- **Email:** admin@qurandiscipline.academy
- **Password:** Admin@1234

## Testing

```bash
# Backend tests
cd backend
npm run test              # Run all tests
npm run test:cov          # Coverage report
npm run test:e2e          # End-to-end tests

# Frontend tests
cd frontend
npm run test              # Run all tests
npm run test:ui           # Visual test runner
npm run test:coverage     # Coverage report
```

## Development Workflow

```bash
# Start everything
docker-compose up -d
cd backend && npm run start:dev &
cd frontend && npm run dev

# Reset database (dev only)
cd backend
npx prisma migrate reset
npx prisma db seed
```

## API Base URLs

- **Development:** `http://localhost:3000/api`
- **Production:** `https://api.qurandiscipline.academy/api`

## Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the project guidelines (see `CLAUDE.md`)
3. Write tests for all new code
4. Ensure all tests pass
5. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions, please open an issue on GitHub or contact [support@qurandiscipline.academy](mailto:support@qurandiscipline.academy).

---

**Built with discipline and consistency.**

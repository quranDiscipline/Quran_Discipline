# CLAUDE.md — Quran Discipline Academy

> This file is the single source of truth for Claude Code when working on this project.
> Read this file completely before writing any code. Follow every instruction precisely.

---

## 🎯 Project Identity

| Field | Value |
|---|---|
| **Project Name** | Quran Discipline Academy Web Application |
| **Domain** | qurandiscipline.academy |
| **Type** | Multi-Portal SaaS Web Application |
| **Industry** | Online Education — Islamic Studies & Quran Teaching |
| **Stage** | Greenfield — Building from scratch |
| **Tagline** | "Discipline Transforms. Consistency Wins." |

---

## 🏗️ Monorepo Structure

```
quran-discipline-academy/
├── CLAUDE.md                          ← You are here
├── .env.example                       ← All environment variables documented
├── .gitignore
├── docker-compose.yml                 ← Local dev (Postgres + Redis)
│
├── backend/                           ← NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── teachers/
│   │   ├── students/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   ├── sessions/
│   │   ├── assessments/
│   │   ├── payments/
│   │   ├── booking/
│   │   ├── chat/
│   │   ├── email/
│   │   ├── admin/
│   │   ├── landing-page/
│   │   ├── progress/
│   │   ├── certificates/
│   │   └── common/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── test/
│   ├── .env
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                          ← React + Vite + TypeScript
    ├── src/
    │   ├── features/                  ← Feature-first organization
    │   │   ├── landing/
    │   │   ├── auth/
    │   │   ├── admin/
    │   │   ├── teacher/
    │   │   ├── student/
    │   │   └── chat/
    │   ├── components/                ← Shared UI components
    │   │   ├── ui/                    ← Primitives (Button, Input, Modal)
    │   │   └── layout/               ← Shell, Sidebar, Header
    │   ├── hooks/                     ← Shared custom hooks
    │   ├── lib/                       ← axios instance, socket, utils
    │   ├── types/                     ← Global TypeScript types
    │   ├── store/                     ← Zustand stores
    │   ├── router/                    ← Route definitions
    │   └── main.tsx
    ├── public/
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## 💻 Technology Stack

### Backend
```
Runtime:        Node.js 20+
Framework:      NestJS 10.x (TypeScript strict mode)
ORM:            Prisma (NOT TypeORM)
Database:       PostgreSQL 15+
Cache:          Redis 7.x
Auth:           JWT (access 15m + refresh 7d in httpOnly cookie)
Passwords:      bcrypt (12 rounds)
Validation:     class-validator + class-transformer
Real-time:      Socket.io
File Upload:    Multer → AWS S3 / Cloudinary
Email:          Nodemailer (SMTP via Hostinger)
Payments:       PayPal REST SDK
Task Queue:     Bull (Redis-backed)
API Docs:       Swagger / OpenAPI (@nestjs/swagger)
Logging:        Winston (NOT console.log in production)
```

### Frontend
```
Framework:      React 18.x (functional components ONLY)
Language:       TypeScript 5.x (strict mode)
Build Tool:     Vite
Styling:        Tailwind CSS 3.x (utility-first, NO separate CSS files)
Routing:        React Router v6
State:          Zustand (global) + React Query (server state)
Forms:          React Hook Form + Zod
HTTP:           Axios (configured instance in lib/axios.ts)
Real-time:      Socket.io-client
Charts:         Recharts
Dates:          date-fns
Icons:          Lucide React
Animations:     Framer Motion
Rich Text:      TipTap (assessments only)
```

### Infrastructure
```
Hosting:        Hostinger VPS
Process Mgr:    PM2
Reverse Proxy:  Nginx (NOT Apache)
SSL:            Let's Encrypt (auto-renew via Certbot)
CDN:            Cloudflare
Storage:        AWS S3 or Cloudinary
CI/CD:          GitHub Actions
```

---

## 🗄️ Database (Prisma Schema)

**ORM: Prisma — ALWAYS use Prisma, never raw SQL or TypeORM.**

### Key Models

```
users               → Base auth record for ALL roles
teachers            → Teacher profile (1:1 with users)
students            → Student profile (1:1 with users)
courses             → Course catalog
enrollments         → Student ↔ Course ↔ Teacher link
teacher_schedules   → Weekly availability slots
sessions            → Individual lessons
progress_tracking   → Learning milestones
assessments         → Tests created by teachers
assessment_submissions → Student test answers
payments            → Payment records
booking_requests    → Landing page form submissions
teacher_profile_changes → Approval workflow for teacher edits
conversations       → Chat threads
chat_messages       → Individual messages
certificates        → Completion certificates
landing_page_content → CMS content blocks
```

### Critical Schema Rules
- ALL primary keys are UUIDs (`@id @default(uuid())`)
- ALL tables have `createdAt DateTime @default(now())`
- ALL tables have `updatedAt DateTime @updatedAt`
- Sex/gender is `enum Sex { male female }` — REQUIRED on users, teachers, students, booking_requests
- Use `@index` for frequently queried fields (email, userId, studentId, teacherId)
- Use `@@unique` for composite unique constraints

### Prisma Commands
```bash
# Generate client after schema changes
npx prisma generate

# Create and run migration
npx prisma migrate dev --name descriptive_migration_name

# Run in production
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio (dev only)
npx prisma studio
```

---

## 🔐 Authentication & Authorization

### JWT Strategy
```
Access Token:   15 minutes expiry, in Authorization header
Refresh Token:  7 days expiry, httpOnly cookie (secure, sameSite: strict)
Password Reset: Email token, 1-hour expiry, single-use
First Login:    Force password change for admin-created accounts
```

### Roles
```
admin    → Full system access
teacher  → Own students, own sessions, own schedule, request profile changes
student  → Own courses, own sessions, own progress, direct profile edit
```

### Guards — APPLY TO EVERY PROTECTED ENDPOINT
```typescript
@UseGuards(JwtAuthGuard)           // Requires valid JWT
@UseGuards(JwtAuthGuard, RolesGuard)  // Requires role
@Roles('admin')                    // Admin only
@Roles('teacher')                  // Teacher only
@Roles('student')                  // Student only
@Roles('admin', 'teacher')         // Multiple roles
```

### Data Isolation Rules
- Teachers can ONLY access their own assigned students' data
- Students can ONLY access their own data
- Admin can access all data
- ALWAYS verify ownership in service layer, not just guard

---

## 👥 User Roles & Capabilities

### Admin
- Full CRUD on all entities
- Approve/reject teacher profile change requests
- Assign students to teachers
- Confirm booking requests, create Zoom links
- Edit landing page content (CMS)
- View analytics and reports
- Process payments and generate invoices
- Issue certificates

### Teacher
- View own dashboard, assigned students, upcoming sessions
- Create/grade assessments and homework
- Track student progress
- Set weekly availability schedule
- **CANNOT directly edit profile** — must submit change request
- Chat with assigned students and admin

### Student
- View own dashboard, enrolled courses, session recordings
- Submit homework and take assessments
- Track own progress
- **CAN directly edit** own name, photo, password
- Chat with assigned teacher and admin
- Download certificates
- View payment history

---

## 🎨 Design System

### Brand Colors (Tailwind config)
```typescript
// tailwind.config.ts — extend with these exact values
colors: {
  primary: {
    DEFAULT: '#064E3B',   // Dark emerald — buttons, headers
    50: '#ECFDF5',
    100: '#D1FAE5',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  secondary: {
    DEFAULT: '#B45309',   // Bronze/amber — accents
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  }
}
```

### Typography
```
Headings:   Inter (fallback: Poppins, sans-serif)
Body:       Inter
Arabic:     Cairo (fallback: Noto Naskh Arabic)
```

### Component Standards
```
Buttons:    rounded-lg, min-h-[44px], transition-all, hover:shadow-md hover:-translate-y-0.5
Cards:      bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md
Inputs:     h-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary
Labels:     text-sm font-semibold text-gray-700 mb-1.5
Errors:     text-sm text-red-600 mt-1
```

### Responsive Breakpoints (mobile-first)
```
Default (mobile):  <640px
sm:                640px
md:                768px
lg:                1024px
xl:                1280px
2xl:               1536px
```

---

## 📁 Feature Folder Structure (Frontend)

Every feature follows this exact structure:

```
features/[feature-name]/
├── components/         ← UI components for this feature
│   └── ComponentName/
│       ├── ComponentName.tsx
│       └── index.ts
├── hooks/              ← Custom hooks (useFeature, useFeatureData)
│   └── useFeatureName.ts
├── pages/              ← Route-level page components
│   └── FeaturePage.tsx
├── services/           ← API call functions (axios)
│   └── feature.service.ts
├── store/              ← Zustand slice (if needed)
│   └── feature.store.ts
├── types/              ← TypeScript types/interfaces
│   └── feature.types.ts
├── utils/              ← Feature-specific utilities
│   └── feature.utils.ts
└── index.ts            ← Public API of this feature
```

---

## 🔌 API Structure

### Base URL
```
Development:  http://localhost:3000/api
Production:   https://api.qurandiscipline.academy/api
```

### Response Envelope
```typescript
// ALL API responses follow this shape
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

// Error response shape
interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: Record<string, string[]>; // Validation errors
  };
}
```

### Pagination Standard
```typescript
// ALL list endpoints accept these query params
interface PaginationQuery {
  page?: number;    // default: 1
  limit?: number;   // default: 20, max: 100
  search?: string;  // optional search
  sortBy?: string;  // field name
  sortOrder?: 'asc' | 'desc'; // default: desc
}
```

### HTTP Status Codes
```
200 OK              → Successful GET, PATCH
201 Created         → Successful POST
204 No Content      → Successful DELETE
400 Bad Request     → Validation error
401 Unauthorized    → Not authenticated
403 Forbidden       → Authenticated but not authorized
404 Not Found       → Resource doesn't exist
409 Conflict        → Duplicate / constraint violation
422 Unprocessable   → Business logic error
429 Too Many Requests → Rate limited
500 Internal Error  → Server error
```

---

## 📧 Email System

### Provider
```
Current:  Nodemailer via Hostinger SMTP (smtp.hostinger.com:465)
Future:   SendGrid (implement as swappable provider)
```

### Template Engine
```
Engine:     Handlebars (.hbs files)
Location:   backend/src/email/templates/
```

### Required Templates
```
booking-confirmation.hbs               → After landing page form submit
booking-confirmed-with-zoom.hbs        → After admin confirms + adds Zoom link
teacher-new-student-assignment.hbs     → When admin assigns student to teacher
teacher-profile-change-request.hbs     → Admin notification of change request
teacher-profile-change-approved.hbs    → Teacher notified of approval
teacher-profile-change-rejected.hbs    → Teacher notified of rejection
student-account-created.hbs            → Welcome email with temp credentials
session-reminder-24hr.hbs              → 24hr before session (to both parties)
payment-confirmation.hbs               → Payment receipt
certificate-issued.hbs                 → Course completion
```

---

## 💬 Real-Time Chat (Socket.io)

### Connection
```typescript
// Auth: Pass JWT in handshake
const socket = io(WS_URL, {
  auth: { token: accessToken }
});
```

### Events
```typescript
// Client → Server
'join-conversation'   payload: { conversationId: string }
'send-message'        payload: { receiverId: string; messageText: string; attachmentUrl?: string }
'mark-as-read'        payload: { messageId: string }
'typing-start'        payload: { conversationId: string }
'typing-stop'         payload: { conversationId: string }

// Server → Client
'new-message'         payload: ChatMessage
'message-read'        payload: { messageId: string; readAt: Date }
'user-typing'         payload: { userId: string; conversationId: string }
'user-online'         payload: { userId: string }
'user-offline'        payload: { userId: string }
'error'               payload: { message: string; code: string }
```

### Chat Access Rules
```
Admin    ↔  Any teacher or student
Teacher  ↔  Admin or own assigned students ONLY
Student  ↔  Admin or own assigned teacher ONLY
```

---

## 🌐 Public Landing Page Sections

Build order for landing page:
1. `Navbar` — Logo, nav links, CTA button
2. `Hero` — Headline, subtext, primary CTA, trust indicators
3. `TrustBar` — Logos / stats (students taught, countries, years)
4. `ProblemSolution` — Pain points → solution narrative
5. `Programs` — 3 programs with pricing cards
6. `HowItWorks` — 3-step process
7. `Teachers` — Teacher profile cards (public view)
8. `Testimonials` — Student reviews / social proof
9. `BookingSection` — Free assessment call CTA
10. `FAQ` — Accordion
11. `Footer` — Links, social, legal

---

## 🛡️ Security Checklist

Apply to EVERY endpoint that modifies data:

```
✅ @UseGuards(JwtAuthGuard)           Authentication
✅ @UseGuards(JwtAuthGuard, RolesGuard) + @Roles()  Authorization
✅ DTO with class-validator decorators  Input validation
✅ Prisma ORM (parameterized queries)  SQL injection prevention
✅ Ownership check in service layer    Data isolation
✅ Rate limiting                       Abuse prevention
✅ File type + size validation         Upload security
✅ Environment variables for secrets   No hardcoding
```

---

## ⚙️ Environment Variables

Create `backend/.env` from this template:

```env
# ─── App ────────────────────────────────────────────────
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# ─── Database ────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/quran_academy_db

# ─── Redis ───────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── JWT ─────────────────────────────────────────────────
JWT_ACCESS_SECRET=change_this_to_a_long_random_string_min_64_chars
JWT_REFRESH_SECRET=change_this_to_another_long_random_string_min_64_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ─── Email (Nodemailer / Hostinger SMTP) ─────────────────
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@qurandiscipline.academy
SMTP_PASS=your_email_password
EMAIL_FROM_NAME=Quran Discipline Academy
EMAIL_FROM_ADDRESS=info@qurandiscipline.academy
ADMIN_EMAIL=admin@qurandiscipline.academy

# ─── PayPal ──────────────────────────────────────────────
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# ─── File Storage (Cloudinary) ───────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── AWS S3 (alternative to Cloudinary) ─────────────────
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# AWS_S3_BUCKET=quran-academy-files
# AWS_REGION=us-east-1

# ─── Zoom ────────────────────────────────────────────────
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret

# ─── Rate Limiting ───────────────────────────────────────
RATE_LIMIT_TTL=900000
RATE_LIMIT_MAX_PUBLIC=100
RATE_LIMIT_MAX_AUTHENTICATED=500
```

Frontend env (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

---

## 📋 NestJS Module Pattern

Every module MUST follow this structure:

```typescript
// ─── module.ts ───────────────────────────────────────────
@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],  // Export if used by other modules
})
export class FeatureModule {}

// ─── controller.ts ──────────────────────────────────────
@ApiTags('feature')
@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}
}

// ─── service.ts ─────────────────────────────────────────
@Injectable()
export class FeatureService {
  constructor(private readonly prisma: PrismaService) {}
}

// ─── dto/create-feature.dto.ts ───────────────────────────
export class CreateFeatureDto {
  @ApiProperty({ example: 'value' })
  @IsString()
  @IsNotEmpty()
  field: string;
}
```

---

## 🧪 Testing — MANDATORY AFTER EVERY PROMPT

> **RULE: After implementing any feature from a prompt, you MUST write unit tests
> before considering the task done. No exceptions. Tests are not optional.**

---

### The Testing Contract

After every single prompt you complete, you will:

1. **Write tests** for everything you just built
2. **Run the tests** and confirm they pass (`npm run test`)
3. **Report the result** — show passing test output before finishing your response
4. **Fix failures** — if a test fails, fix the code OR the test before moving on

If a prompt adds 1 service method → write tests for that method.
If a prompt adds 5 endpoints → write tests for all 5.
There is no such thing as "I'll add tests later."

---

### Backend Testing (NestJS + Jest)

#### Test File Location
```
Co-locate tests with source files:
src/auth/auth.service.ts          → src/auth/auth.service.spec.ts
src/teachers/teachers.service.ts  → src/teachers/teachers.service.spec.ts
src/booking/booking.service.ts    → src/booking/booking.service.spec.ts

E2E tests (full HTTP request lifecycle):
test/auth.e2e-spec.ts
test/booking.e2e-spec.ts
```

#### Commands
```bash
npm run test              # Run all unit tests
npm run test:watch        # Watch mode during development
npm run test:cov          # Coverage report (target: 80%+)
npm run test:e2e          # End-to-end tests
npm run test -- --testPathPattern=auth   # Run specific module tests
```

#### Unit Test Template (Service)
```typescript
// src/teachers/teachers.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { TeachersService } from './teachers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

// ─── Mock PrismaService ─────────────────────────────────────────────────────
const mockPrismaService = {
  teacher: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('TeachersService', () => {
  let service: TeachersService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();   // Reset mocks between tests
  });

  // ─── findById ─────────────────────────────────────────────────────────────
  describe('findById', () => {
    it('should return a teacher when found', async () => {
      const mockTeacher = { id: 'uuid-1', bio: 'Test bio' };
      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await service.findById('uuid-1');

      expect(result).toEqual(mockTeacher);
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when teacher does not exist', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
```

#### What to Test in Every Service
```
✅ Happy path — correct input returns expected output
✅ Not found — throws NotFoundException with correct message
✅ Forbidden — throws ForbiddenException when accessing other users' data
✅ Validation — throws BadRequestException on invalid input
✅ Edge cases — empty arrays, null values, boundary conditions
✅ Side effects — correct Prisma methods called with correct args
✅ Error propagation — database errors are caught and rethrown correctly
```

#### Controller Test Template
```typescript
// src/booking/booking.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

const mockBookingService = {
  createBookingRequest: jest.fn(),
  getBookingRequests: jest.fn(),
};

describe('BookingController', () => {
  let controller: BookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [{ provide: BookingService, useValue: mockBookingService }],
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('POST /booking-requests', () => {
    it('should create a booking request and return 201', async () => {
      const dto = { fullName: 'John Doe', email: 'john@test.com' };
      const mockResult = { id: 'uuid-1', ...dto, status: 'pending' };
      mockBookingService.createBookingRequest.mockResolvedValue(mockResult);

      const result = await controller.createBookingRequest(dto as any);

      expect(result).toEqual(mockResult);
      expect(mockBookingService.createBookingRequest).toHaveBeenCalledWith(dto);
    });
  });
});
```

---

### Frontend Testing (Vitest + React Testing Library)

#### Test File Location
```
Co-locate with components:
src/features/auth/components/LoginForm/LoginForm.tsx
→ src/features/auth/components/LoginForm/LoginForm.test.tsx

src/features/booking/hooks/useBookingForm.ts
→ src/features/booking/hooks/useBookingForm.test.ts
```

#### Commands
```bash
npm run test              # Run all tests
npm run test:ui           # Visual test runner (Vitest UI)
npm run test:coverage     # Coverage report
npm run test -- LoginForm # Run specific component tests
```

#### Component Test Template
```typescript
// src/features/booking/components/BookingForm/BookingForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BookingForm } from './BookingForm';

// Mock API service
vi.mock('../../services/booking.service', () => ({
  createBookingRequest: vi.fn(),
}));

describe('BookingForm', () => {
  it('renders all required fields', () => {
    render(<BookingForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    render(<BookingForm />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /book/i }));

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows error for invalid email format', async () => {
    render(<BookingForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /book/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('submits successfully with valid data', async () => {
    const { createBookingRequest } = await import('../../services/booking.service');
    (createBookingRequest as ReturnType<typeof vi.fn>).mockResolvedValue({ id: '1' });

    render(<BookingForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@test.com');
    await user.click(screen.getByRole('button', { name: /book/i }));

    await waitFor(() => {
      expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
    });
  });
});
```

#### What to Test in Every Component
```
✅ Renders correctly (snapshot or key elements present)
✅ Shows validation errors on invalid input
✅ Shows loading state while API call is in progress
✅ Shows success state after successful submission
✅ Shows error state when API call fails
✅ Calls the correct service function with correct arguments
✅ Accessibility — elements have correct roles and labels
```

#### Custom Hook Test Template
```typescript
// src/features/auth/hooks/useAuth.test.ts

import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('starts with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates state after successful login', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
  });
});
```

---

### Coverage Requirements

```
Backend Services:     ≥ 85% line coverage
Backend Controllers:  ≥ 80% line coverage
Frontend Components:  ≥ 75% line coverage
Frontend Hooks:       ≥ 85% line coverage
Utility Functions:    ≥ 90% line coverage

Critical paths (MUST be 100% covered):
  - Auth login / logout / token refresh
  - Payment processing
  - Teacher profile change request + approval
  - Booking request creation
  - Role-based access control
```

---

### Test Quality Rules

```
✅ DO: Test behavior, not implementation details
✅ DO: Use descriptive test names ("should throw NotFoundException when teacher not found")
✅ DO: One assertion concept per test (multiple expect() ok if they test same thing)
✅ DO: Reset mocks in afterEach()
✅ DO: Use realistic mock data (not foo/bar/test123)
✅ DO: Test error paths as thoroughly as happy paths

❌ DON'T: Test that React Hook Form calls setEmail (implementation detail)
❌ DON'T: Write tests that always pass regardless of behavior
❌ DON'T: Use snapshot tests as primary test strategy
❌ DON'T: Share state between tests (each test must be independent)
❌ DON'T: Mock everything — test real logic where possible
❌ DON'T: Skip testing error handling because "it's unlikely"
```

---

### Reporting Tests in Responses

After each prompt, your response must end with:

```
### ✅ Tests Written & Passing

Files created:
- src/teachers/teachers.service.spec.ts     (12 tests)
- src/teachers/teachers.controller.spec.ts  ( 8 tests)

Test results:
PASS  src/teachers/teachers.service.spec.ts
  TeachersService
    findById
      ✓ should return teacher when found (3ms)
      ✓ should throw NotFoundException when not found (1ms)
    create
      ✓ should create teacher with hashed data (5ms)
      ✓ should throw ConflictException on duplicate email (2ms)

Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
Coverage:    88.5% statements
```

---

## 🔄 Development Workflow

### Starting Local Development
```bash
# 1. Start infrastructure
docker-compose up -d   # Postgres + Redis

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev      # Runs on :3000

# 3. Frontend
cd frontend
npm install
npm run dev            # Runs on :5173
```

### Database Reset (Development)
```bash
cd backend
npx prisma migrate reset   # ⚠️ Destroys all data
npx prisma db seed         # Re-seed
```

---

## 🚨 Critical Rules — NEVER Break These

### Environment Variables — READ BEFORE ADDING ANYTHING
**STOP. Before adding any new variable to `.env` or `.env.example`, follow this checklist:**

```
Step 1: READ the existing .env.example top to bottom
Step 2: SEARCH for the variable name — does it already exist?
Step 3: SEARCH for similar variables — is there already a SMTP_HOST, JWT_SECRET, etc.?

Only THEN decide:
  ├── Variable already exists     → USE the existing one. Do NOT add a duplicate.
  ├── Similar variable exists     → ASK if it should be reused or if a new one is needed.
  └── Truly new variable needed   → ADD it with a comment explaining what it's for.
```

**Forbidden:**
```
❌ Adding DATABASE_URL when it already exists (even spelled differently)
❌ Adding MAIL_HOST when SMTP_HOST already exists
❌ Adding JWT_SECRET when JWT_ACCESS_SECRET already exists
❌ Adding ANY variable without checking .env.example first
❌ Duplicating variables with different names for the same service
```

**Required format when adding a new variable:**
```env
# ─── Service Name ────────────────────────────────────────
# PURPOSE: What this variable is used for
# WHERE: Which module/service reads this
# EXAMPLE: What a real value looks like
NEW_VARIABLE=example_value
```

---

### Code Quality
1. **NO `any` type** — Use `unknown` + type narrowing if type is genuinely unknown
2. **NO `console.log`** — Use Winston logger (`this.logger = new Logger(ServiceName.name)`)
3. **NO hardcoded secrets** — Everything in `.env`
4. **NO skipping error handling** — Every async operation in try-catch
5. **NO incomplete code** — Never output `// ... rest of implementation`

### Architecture
6. **NO direct database queries in controllers** — Only in services
7. **NO business logic in DTOs** — DTOs are for validation only
8. **NO cross-module direct imports** — Use exported service via module system
9. **ALWAYS paginate** list endpoints (default 20 per page)
10. **ALWAYS validate** ownership before returning/modifying data

### Frontend
11. **NO class components** — Functional only
12. **NO inline styles** — Tailwind classes only
13. **NO `localStorage` for tokens** — Use httpOnly cookies for refresh, memory for access
14. **ALWAYS handle** loading, error, and empty states in every component
15. **ALWAYS use** React Query for server state (not useEffect + fetch)

### Database
16. **ALWAYS write Prisma migrations** when changing schema
17. **NEVER use `prisma.$queryRaw`** unless absolutely necessary and fully sanitized
18. **ALWAYS add indexes** for foreign keys and frequently filtered fields
19. **NEVER delete** — use soft deletes (`isActive: false`) for users/courses
20. **ALWAYS use transactions** for multi-table writes

---

## 📊 Build Order / Phases

Follow this exact sequence when building:

```
Phase 1:  Project Setup
          ├── Monorepo structure + Docker + .env files
          ├── NestJS bootstrap (app.module, main.ts, Swagger)
          ├── Prisma setup + complete schema + migrations
          ├── PrismaService (global module)
          ├── React + Vite + Tailwind setup
          ├── Design system (tailwind.config, global CSS, fonts)
          └── Shared UI components (Button, Input, Card, Modal, Badge)

Phase 2:  Authentication
          ├── Backend: Auth module (JWT strategy, guards, decorators)
          ├── Backend: Users module (CRUD)
          ├── Frontend: Auth store (Zustand)
          ├── Frontend: Login page
          ├── Frontend: Route guards (ProtectedRoute component)
          └── Frontend: Axios interceptors (token refresh)

Phase 3:  Admin Portal
          ├── Admin layout (sidebar, header)
          ├── Dashboard (stats cards, charts)
          ├── Teacher management (CRUD)
          ├── Student management (CRUD)
          ├── Booking requests (review + assign)
          ├── Course management (CRUD)
          ├── Enrollments management
          ├── Teacher profile change approvals
          └── Payment tracking

Phase 4:  Teacher Portal
          ├── Teacher layout
          ├── Teacher dashboard
          ├── My students list + individual profiles
          ├── Schedule management (availability slots)
          ├── Sessions (view + update notes/homework)
          ├── Assessment creation + grading
          ├── Progress tracking (update student progress)
          └── Profile (view-only + request changes form)

Phase 5:  Student Portal
          ├── Student layout
          ├── Student dashboard
          ├── My courses + course detail
          ├── Sessions (view + recordings)
          ├── Homework submissions
          ├── Assessments (take + view results)
          ├── Progress tracker (visual charts)
          ├── Payments + invoices
          ├── Certificates
          └── Profile (direct edit)

Phase 6:  Landing Page
          ├── All 11 sections (see Landing Page Sections above)
          ├── Booking form (custom Calendly alternative)
          ├── SEO meta tags
          └── Mobile optimization

Phase 7:  Real-Time Chat
          ├── Backend: Chat gateway (Socket.io)
          ├── Backend: Chat REST endpoints
          ├── Frontend: Chat store (Zustand)
          ├── Frontend: Conversation list
          └── Frontend: Chat window with real-time messages

Phase 8:  Email Notifications
          ├── Email module setup (Nodemailer + Handlebars)
          ├── All 10 email templates
          └── Integration with each feature (triggers)

Phase 9:  Payments
          ├── PayPal integration (backend)
          ├── Payment recording + receipts
          └── Frontend payment flow

Phase 10: Polish & Deploy
          ├── Analytics (Bull queue for background jobs)
          ├── File uploads (Cloudinary integration)
          ├── Certificate PDF generation
          ├── Performance optimization
          ├── Nginx config
          ├── PM2 config
          ├── GitHub Actions CI/CD
          └── Production deployment to Hostinger VPS
```

---

## 🧩 Shared Types (Reference)

```typescript
// Canonical types used across the entire app

export type UserRole = 'admin' | 'teacher' | 'student';
export type Sex = 'male' | 'female';
export type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancelled';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';
export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ProfileChangeStatus = 'pending' | 'approved' | 'rejected';
export type PackageType = 'foundation' | 'mastery' | 'advanced' | 'group_basic' | 'group_premium';
export type CourseType = 'memorization' | 'islamic_studies' | 'understanding';
export type StudentLevel = 'beginner' | 'intermediate' | 'advanced';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  sex: Sex;
  profilePictureUrl: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## 📌 Git Commit Convention

```
feat:     New feature
fix:      Bug fix
refactor: Code change (no feature/fix)
style:    Formatting only
docs:     Documentation
test:     Adding/updating tests
chore:    Build/tooling/deps

Examples:
feat(auth): implement JWT refresh token rotation
fix(chat): resolve message duplication on reconnect
feat(admin): add teacher profile change approval workflow
refactor(students): extract enrollment logic into separate service
```

---

## ⚡ Performance Targets

```
Landing page LCP:         < 3 seconds
Portal dashboard load:    < 2 seconds
API response time (p95):  < 500ms
Database query time:      < 200ms
WebSocket latency:        < 100ms
Initial JS bundle:        < 300KB
```

---

## 🩺 Logging Standards

```typescript
// In every NestJS service:
private readonly logger = new Logger(ServiceName.name);

// Use appropriate levels:
this.logger.log('Session scheduled successfully');        // Info
this.logger.warn('Payment attempt failed, retrying...');  // Warning
this.logger.error('Database connection failed', error.stack); // Error
this.logger.debug('Processing booking request', payload);    // Debug (dev only)

// NEVER: console.log, console.error, console.warn
```

---

*Last updated: Project initialization*
*Version: 1.1.0 — Added mandatory testing contract + .env variable safety rules*
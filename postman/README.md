# Postman Collection - Quran Discipline Academy API

This directory contains Postman collections and environments for testing the Quran Discipline Academy API.

## Files

| File | Description |
|------|-------------|
| `Quran_Discipline_Academy_API.postman_collection.json` | Main API collection with all endpoints |
| `Quran_Discipline_Environment.postman_environment.json` | Local development environment |
| `Quran_Discipline_Environment_Production.postman_environment.json` | Production environment |

## Import Instructions

1. Open Postman
2. Click **Import** in the top left
3. Select the files to import:
   - Import the Collection file
   - Import the Environment file
4. Select the environment from the dropdown (top right)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:3000/api` |
| `accessToken` | JWT access token (auto-set after login) | `eyJhbGciOiJIUzI1NiIs...` |
| `tokenExpiry` | Token expiration timestamp (auto-set) | `1701234567890` |
| `userId` | Current user ID (auto-set after login) | `uuid-here` |
| `teacherId` | Teacher ID (set after creating teacher) | `uuid-here` |
| `studentId` | Student ID (set after creating student) | `uuid-here` |
| `courseId` | Course ID (set after creating course) | `uuid-here` |
| `enrollmentId` | Enrollment ID (set after creating enrollment) | `uuid-here` |
| `bookingId` | Booking request ID (set after creating) | `uuid-here` |
| `paymentId` | Payment ID (set after creating payment) | `uuid-here` |
| `changeId` | Profile change request ID | `uuid-here` |

## Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm run start:dev
```

### 2. Test Login Endpoint

Use the **Login** request in the Auth folder:

```json
{
  "email": "admin@qurandiscipline.academy",
  "password": "Admin@1234"
}
```

**Note:** After login, `accessToken` and other user variables are automatically saved to the environment.

### 3. Test Admin Endpoints

All admin endpoints require authentication. The collection uses Bearer token auth from the `accessToken` environment variable.

## API Endpoints

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/logout` | Logout and clear tokens |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| PATCH | `/auth/change-password` | Change password (authenticated) |

### Admin - Teachers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/teachers` | Get all teachers (paginated, search, availability filter) |
| GET | `/admin/teachers/:id` | Get teacher by ID |
| POST | `/admin/teachers` | Create new teacher account |
| PATCH | `/admin/teachers/:id` | Update teacher profile |
| PATCH | `/admin/teachers/:id/deactivate` | Deactivate teacher |
| PATCH | `/admin/teachers/:id/activate` | Reactivate teacher |
| GET | `/admin/teachers/stats` | Get teacher statistics |

### Admin - Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/students` | Get all students (paginated, search, status filter) |
| GET | `/admin/students/:id` | Get student by ID |
| POST | `/admin/students` | Create new student account |
| PATCH | `/admin/students/:id` | Update student profile |
| PATCH | `/admin/students/:id/deactivate` | Deactivate student |
| PATCH | `/admin/students/:id/activate` | Reactivate student |
| GET | `/admin/students/stats` | Get student statistics |

### Admin - Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/courses` | Get all courses (paginated, filters) |
| GET | `/admin/courses/:id` | Get course by ID |
| POST | `/admin/courses` | Create new course |
| PATCH | `/admin/courses/:id` | Update course |
| PATCH | `/admin/courses/:id/deactivate` | Deactivate course |
| PATCH | `/admin/courses/:id/activate` | Reactivate course |

### Admin - Enrollments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/enrollments` | Get all enrollments (paginated, status filter) |
| GET | `/admin/enrollments/:id` | Get enrollment by ID |
| POST | `/admin/enrollments` | Create new enrollment |
| PATCH | `/admin/enrollments/:id/status` | Update enrollment status |
| PATCH | `/admin/enrollments/:id/progress` | Update progress percentage |

**Status values:** `active` | `completed` | `paused` | `cancelled`

**Package types:** `foundation` | `mastery` | `advanced` | `group_basic` | `group_premium`

### Admin - Booking Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/booking-requests` | Get all requests (paginated, status filter) |
| GET | `/admin/booking-requests/:id` | Get request by ID |
| PATCH | `/admin/booking-requests/:id/assign` | Assign teacher to request |
| PATCH | `/admin/booking-requests/:id/confirm` | Confirm with Zoom link |
| PATCH | `/admin/booking-requests/:id/cancel` | Cancel request |

**Status values:** `pending` | `confirmed` | `completed` | `cancelled`

### Admin - Profile Changes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/teacher-profile-changes` | Get all requests (paginated, filters) |
| GET | `/admin/teacher-profile-changes/:id` | Get request by ID |
| PATCH | `/admin/teacher-profile-changes/:id/approve` | Approve profile change |
| PATCH | `/admin/teacher-profile-changes/:id/reject` | Reject profile change |

**Status values:** `pending` | `approved` | `rejected`

### Admin - Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/payments` | Get all payments (paginated, filters) |
| GET | `/admin/payments/:id` | Get payment by ID |
| POST | `/admin/payments` | Manually record payment |
| PATCH | `/admin/payments/:id/verify` | Mark as verified |
| GET | `/admin/payments/summary/revenue` | Get revenue summary |

**Status values:** `pending` | `completed` | `failed` | `refunded`

**Payment methods:** `paypal` | `bank_transfer`

### Admin - Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/stats` | Get dashboard statistics |
| GET | `/admin/dashboard/revenue-chart` | Get revenue chart data |
| GET | `/admin/dashboard/students/by-country` | Students by country |
| GET | `/admin/dashboard/students/by-package` | Students by package type |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/booking-requests` | Create public booking request |

## Features

### Auto Token Refresh

The collection has a pre-request script that automatically refreshes your access token if it's expired.

### Test Scripts

Each request includes test scripts that:
- Validate response status codes
- Check response structure
- Save important data (tokens, IDs) to environment variables

### Cookie Handling

The `/auth/login` and `/auth/refresh-token` endpoints set an httpOnly cookie for the refresh token. Postman automatically handles this.

## Password Requirements

When creating users or resetting passwords:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- Example: `Password123!`

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access |
| `teacher` | Teaching functions |
| `student` | Learning functions |

## Seeded Users (Development)

After running `npx prisma db seed`, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@qurandiscipline.academy` | `Admin@1234` |

## Enum Values Reference

### Course Types
- `memorization` - Quran memorization courses
- `islamic_studies` - Islamic studies courses
- `understanding` - Quran understanding courses

### Subscription Status
- `trial` - Trial period
- `active` - Active subscription
- `paused` - Paused subscription
- `cancelled` - Cancelled subscription

### Package Types
- `foundation` - Foundation level
- `mastery` - Mastery level
- `advanced` - Advanced level
- `group_basic` - Group basic
- `group_premium` - Group premium

### Sex
- `male`
- `female`

## Troubleshooting

### 401 Unauthorized
- Your token may be expired. Try logging in again.
- The token refresh script will attempt to auto-refresh before each request.

### 403 Forbidden
- You don't have permission for this endpoint (admin role required for admin endpoints).

### 422 Unprocessable Entity
- Check your request body format.
- Ensure password meets requirements.
- Check for required fields.

### Cookie Not Being Set
- Ensure Postman's **Cookie Jar** is enabled:
  - Settings → General → Turn on "Cookie Jar"

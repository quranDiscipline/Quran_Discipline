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
| `userEmail` | Current user email (auto-set) | `admin@qurandiscipline.academy` |
| `userRole` | Current user role (auto-set) | `admin` |
| `lastLoginEmail` | Last email used for login (for convenience) | `admin@qurandiscipline.academy` |

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

**Note:** Tests validate responses but do NOT save tokens to the environment. You'll need to manually set the `accessToken` in your environment for authenticated requests.

### 3. Test Authenticated Endpoints

For protected endpoints, manually set the `accessToken` environment variable from the login response, or use a tool like Postman's cookie handling with refresh tokens. The collection includes:

**Auth Endpoints:**
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `PATCH /auth/change-password` - Change password (authenticated)

**User Endpoints (Admin Only):**
- `GET /users` - Get all users (paginated)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (soft delete)

## Features

### Auto Token Refresh

The collection has a pre-request script that automatically refreshes your access token if it's expired. You don't need to manually refresh!

### Test Scripts

Each request includes test scripts that:
- Validate response status codes
- Check response structure
- Save important data (tokens, user IDs) to environment variables

### Cookie Handling

The `/auth/login` and `/auth/refresh-token` endpoints set an httpOnly cookie for the refresh token. Postman automatically handles this - just make sure **Cookie Jar** is enabled in Postman settings.

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

## Troubleshooting

### 401 Unauthorized
- Your token may be expired. Try logging in again.
- The token refresh script will attempt to auto-refresh before each request.

### 403 Forbidden
- You don't have permission for this endpoint (e.g., non-admin trying to access admin endpoints).

### 422 Unprocessable Entity
- Check your request body format.
- Ensure password meets requirements.
- Check for required fields.

### Cookie Not Being Set
- Ensure Postman's **Cookie Jar** is enabled:
  - Settings → General → Turn on "Cookie Jar"

## Collection Scripts Reference

### Pre-Request Script (Collection Level)
```javascript
// Auto-refresh token if expired
const token = pm.environment.get('accessToken');
const tokenExpiry = pm.environment.get('tokenExpiry');
const now = new Date().getTime();

if (token && tokenExpiry && now > parseInt(tokenExpiry)) {
    // Send refresh request...
}
```

### Test Script (Login Example)
```javascript
// Validate response
pm.test('Status code is 201', () => {
    pm.response.to.have.status(201);
});

// Save token
const jsonData = pm.response.json();
pm.environment.set('accessToken', jsonData.data.accessToken);
```

# SkillBridge

**SkillBridge** is a production-grade freelance marketplace platform built exclusively for students. Clients post projects, student freelancers bid and collaborate in real-time, with escrow-style payments, ratings, and admin oversight.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 14, React 18, CSS Modules, Zustand, React Hook Form, Framer Motion, Socket.IO Client, Axios |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO, Multer, Cloudinary, Nodemailer, Winston |
| DevOps | Docker, Docker Compose, Nginx |

**Constraints:** JavaScript only (no TypeScript), plain CSS / CSS Modules only (no Tailwind, MUI, etc.)

## Features

- **Authentication:** Signup, login, JWT + refresh tokens, forgot/reset password, email verification, role-based access (student, client, admin)
- **Profiles:** Skills, portfolio, resume, education, experience, client company info
- **Projects:** CRUD, drafts, attachments, search/filter, status workflow
- **Bidding:** Proposals, accept/reject, hire freelancer
- **Realtime:** Socket.IO chat, typing indicators, online status, notifications
- **Payments:** Mock escrow fund/release, milestones, Stripe-ready architecture
- **Reviews:** Star ratings, moderation
- **Admin:** Analytics, user ban/unban, reports

## Project Structure

```
SkillBridge/
├── backend/
│   └── src/
│       ├── config/       # DB, Cloudinary, Swagger
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── sockets/
│       ├── utils/
│       └── validations/
├── frontend/
│   ├── app/              # Next.js App Router pages
│   ├── components/
│   ├── providers/
│   ├── store/            # Zustand
│   ├── styles/           # globals, variables, theme, animations
│   └── lib/
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Optional: Docker & Docker Compose

### 1. Clone & install

```bash
cd SkillBridge/backend
cp .env.example .env
npm install

cd ../frontend
cp .env.local.example .env.local
npm install
```

### 2. Configure environment

**backend/.env**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillbridge
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32
CLIENT_URL=http://localhost:3000
# Optional: Cloudinary, SMTP
```

**frontend/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Seed admin (optional)

```bash
cd backend
node src/utils/seed.js
# admin@skillbridge.com / admin123456
```

### 4. Run development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000/api
- Swagger docs: http://localhost:5000/api/docs

## Docker

```bash
# Copy env files first
cp backend/.env.example backend/.env

docker-compose up --build
```

Services: MongoDB `:27017`, Backend `:5000`, Frontend `:3000`, Nginx `:80`

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/projects` | List/search projects |
| POST | `/api/projects/:id/bids` | Submit bid |
| POST | `/api/projects/:id/hire` | Hire freelancer |
| GET | `/api/messages/conversations` | List chats |
| POST | `/api/payments/:id/fund` | Mock escrow fund |
| POST | `/api/payments/:id/release` | Release payment |
| GET | `/api/admin/analytics` | Admin stats |

Full OpenAPI documentation at `/api/docs` when the server is running.

## Socket.IO Events

| Event | Description |
|-------|-------------|
| `user-online` | User online/offline status |
| `send-message` | Send chat message |
| `receive-message` | Incoming message |
| `typing` / `stop-typing` | Typing indicators |
| `notification` | Realtime notification |

Authenticate via `auth.token` in handshake.

## Testing

```bash
cd backend
npm test
```

Uses Jest + Supertest for auth and health endpoints.

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render / Railway |
| Database | MongoDB Atlas |

Set environment variables on each platform matching `.env.example` files. Enable CORS `CLIENT_URL` to your production frontend URL.

## Security

- Helmet, rate limiting, mongo sanitization, XSS clean
- HTTP-only cookies for tokens
- bcrypt password hashing
- JWT access + refresh rotation
- Socket authentication middleware
- Role-based route protection



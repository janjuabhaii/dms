# DMS — Distribution Management System

Phase 1 foundation: project architecture only. No business features yet —
that starts in Phase 2 (backend models + auth + orders) and Phase 3
(frontend design system + pages).

## Structure

```
dms/
├── backend/
│   ├── src/
│   │   ├── config/         # env.js, db.js — env loading & Mongo connection
│   │   ├── models/         # (empty) Mongoose schemas — Phase 2
│   │   ├── controllers/    # (empty) business logic — Phase 2+
│   │   ├── routes/         # health.routes.js + central index.js mount point
│   │   ├── middleware/     # notFound.js, errorHandler.js
│   │   ├── utils/          # ApiError, ApiResponse, asyncHandler
│   │   ├── app.js          # Express app (middleware + routes), exported
│   │   └── server.js       # HTTP server + Socket.io + DB boot
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # axiosInstance.js — single Axios client
    │   ├── components/
    │   │   ├── ui/          # Shadcn primitives (added on-demand, Phase 3+)
    │   │   ├── layout/      # Sidebar/topbar shells — Phase 3
    │   │   └── common/      # Reusable widgets — Phase 4
    │   ├── pages/
    │   │   ├── auth/        # LoginPage (placeholder)
    │   │   ├── admin/       # AdminDashboardPage (placeholder)
    │   │   └── worker/      # WorkerDashboardPage (placeholder)
    │   ├── routes/           # AppRoutes.jsx, ProtectedRoute.jsx
    │   ├── context/          # AuthContext.jsx
    │   ├── hooks/            # (empty) React Query hooks — later phases
    │   ├── lib/              # utils.js (cn() helper for Shadcn)
    │   └── styles/           # globals.css — design tokens, dark/light theme
    ├── components.json      # Shadcn CLI config
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env    # fill in MONGODB_URI, JWT_SECRET, etc.
npm install
npm run dev              # starts on http://localhost:5000
```

Verify it's alive: `GET http://localhost:5000/api/v1/health`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`
(see `vite.config.js`), so the Axios instance just calls `/api/v1/...`
with no host hardcoded.

### 3. Shadcn UI

Components are added on-demand rather than all at once:

```bash
cd frontend
npx shadcn@latest add button card input dialog table tabs select toast
```

This project is preconfigured (`components.json`, path aliases, CSS
variables in `globals.css`) so the CLI drops components straight into
`src/components/ui/` with working imports.

## What's deliberately NOT here yet

- No Mongoose schemas (Phase 2)
- No auth endpoints or JWT middleware (Phase 2)
- No real login form or dashboard UI (Phase 3/4)
- No Cloudinary wiring, no Socket.io event logic beyond connection
  (both stubbed, ready to extend in Phase 2+)

## API conventions established in this phase

- Every success response: `{ success: true, statusCode, message, data }`
  (see `ApiResponse.js`)
- Every error response: `{ success: false, statusCode, message, errors }`
  (see `errorHandler.js` — handles ApiError, Mongoose CastError/ValidationError/
  duplicate-key, and JWT errors uniformly)
- Controllers wrap async logic in `asyncHandler` instead of try/catch
- Frontend Axios instance auto-attaches the JWT and redirects to `/login`
  on 401, in one place

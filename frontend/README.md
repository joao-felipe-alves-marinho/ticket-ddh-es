# IssueFlow — Frontend

Small, focused Next.js frontend for the IssueFlow ticketing demo.

Why: quick UI to create, view and act on tickets. Minimal, local-first.

Quick start
- Prereqs: Node 18+, npm.
- Install deps:

```bash
npm install
```

- Run dev server (port 3001):

```bash
npm run dev
```

- Build for prod:

```bash
npm run build
npm run start
```

Configuration
- The frontend reads the backend base URL from `NEXT_PUBLIC_API_BASE_URL`.
- Default (when not set): `http://localhost:3000/api/v1`.
- Example `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

What it contains
- Next.js app (App Router).
- Pages: home, login, register.
- Components: auth shell, navbar, ticket modals.
- API helper: `lib/auth.ts` — handles auth, session storage, ticket calls.

Usage notes
- Start backend first. Frontend talks to `/api/v1` endpoints.
- Login or register at `/login` then create or act on tickets.
- Dev server runs on port 3001 to avoid conflict with backend.

Scripts
- `npm run dev` — development server (port 3001)
- `npm run build` — build
- `npm run start` — production server (port 3001)
- `npm run lint` — lint

Troubleshooting
- 401 / Not authenticated: log in and ensure token saved in localStorage.
- API errors: confirm `NEXT_PUBLIC_API_BASE_URL` points to running backend.

Where to look next
- Frontend entry: `app/page.tsx` and `app/layout.tsx`.
- Auth helper: `lib/auth.ts`.

License & meta
- Project repo root has license and project-wide docs.

---
Concise. Needs more details? Tell me what to add.

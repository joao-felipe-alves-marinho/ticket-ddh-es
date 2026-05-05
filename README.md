## IssueFlow (ticket-ddh-es)

Small demo. Show DDD + Event Sourcing + CQRS with NestJS.

Why
- Learn patterns: aggregates, events, projections, ports & adapters.

Quick start
- Prereqs: Node 18+, npm, Docker optional.

- Backend dev:

```bash
cd backend
npm install
npm run start:dev
```

- Frontend dev:

```bash
cd frontend
npm install
npm run dev
```

- Full stack with Docker:

```bash
docker compose up --build
```

- Full stack stop/remove:

```bash
docker compose down
```

Ports
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`
- MongoDB: `localhost:27017`
- KurrentDB: `localhost:2113`

Config
- Backend-read/write URLs set via envs.
- Frontend uses `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000/api/v1`).

What here
- `backend/` — NestJS app, domain, application, infra.
- `frontend/` — Next.js UI (App Router, auth, ticket UI).

Important concepts
- Event store (KurrentDB) is single source of truth for writes.
- Read models built by projectors into MongoDB.
- Optimistic concurrency via expected revision on stream writes.

Where to look
- Domain foundations: `backend/src/shared/domain`.
- Ticket domain: `backend/src/modules/ticket`.
- Auth + HTTP adapters: `backend/src/modules/auth/infrastructure`.
- Frontend auth helper: `frontend/lib/auth.ts`.

Need help?
- Want tests, examples, or walkthroughs added here? Tell me.

---
Concise. Caveman style. Want expand sections or add diagrams?


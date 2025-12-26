## Sudoku online
Sudoku implementation with per-user sessions (HTTP-only cookie), server-side puzzle generation, persistent game state, scoring, hints, pause/resume, and leaderboard records.

### Stack
- Nuxt 4 + Nitro
- Prisma
- Vitest + vitest-playwright
- Postman
- Tailwind

---

## Docker

Build and run with Docker:

```bash
docker build -t sudoku-nuxt .
docker run --rm -p 3000:3000 sudoku-nuxt
```

Run with Docker Compose (bind-mounts `dev.db` for persistence):

```bash
docker compose up --build
```

or 


```bash
docker compose build --no-cache
docker compose up
```


## Why Nuxt (Nitro) for backend
- **Server-side puzzle generation**: the solution never needs to be exposed to the client.
- **Per-user session via HTTP-only cookie**: each user (browser) owns their games.
- **Simple deployment model**: API routes + UI in one codebase (but backend stays clean and testable).

---

## High-level architecture

- **API routes** live under `server/api/**`
- **Domain services** live under `server/services/**` (pure, testable logic)
- **Session** is determined by `sid` cookie (HTTP-only)
- **Database** persists `Game` rows with `stateJson` holding authoritative game state
- **Records** persist finished game scores + duration

---

## Diagrams

More details and diagrams:
- Backend: [`Docs/backend.md`](/Docs/backend.md) — request flow and server modules.
- Frontend: [`Docs/frontend.md`](/Docs/frontend.md) — page-to-API flow and client fetch pattern.

Both files include a short explanation before the diagrams to keep them easy to scan.



### Articles
https://news.google.com/newspapers?nid=Ehil0879vHcC&dat=18950502&printsec=frontpage&hl=en

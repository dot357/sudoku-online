## Sudoku online


<video width="640" height="480" controls>
  <source src="./public/sudoku.mp4" type="video/mp4">
</video>

Sudoku implementation with per-user sessions (HTTP-only cookie), server-side puzzle generation, persistent game state, scoring, hints, pause/resume, and leaderboard records.

Note: The spec did not require a backend. I chose a server-side architecture to ensure puzzle integrity, persistent records, and clear separation of domain logic for testing.

### Stack
- Nuxt 4 + Nitro
- Prisma (SQLite)
- Vitest
- Postman (collection included)
- Tailwind

---

## Node and package manager
- **Node.js**: 20.x (see `/.nvmrc`)
- **npm**: any recent 10.x works

If you use `nvm`:
```bash
nvm use
```

---

## Local setup

Install dependencies:
```bash
npm install
```

Environment (SQLite by default):
- `DATABASE_URL="file:./dev.db"` (see `/.env`)

Vercel note (SQLite + serverless):
- Use `DATABASE_URL="file:/tmp/dev.db"` in Vercel env vars to avoid read-only FS errors.
- `/tmp` is ephemeral; data resets on cold starts.

Start the dev server:
```bash
npm run dev
```

---

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run test` - run unit tests
- `npm run prisma:studio` - open Prisma Studio

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

Or:
```bash
docker compose build --no-cache
docker compose up
```

---

## Game rules (scoring and hints)
- **Correct entry**: +5 when filling an empty cell with the correct value
- **Wrong entry**: -1 and increments error count
- **Hint**: reveals a correct value, marks it as given, and applies a penalty of `-(3 + hintsUsed)`
- **Max hints**: 10 per game
- **Finish bonus**: `max(0, 500 - elapsedSec)` applied when the board is solved
- **Pause/Resume**: pauses elapsed time; time excludes paused duration

---

## API and architecture

Quick reference:
- API endpoints and error behavior: [`Docs/backend.md`](/Docs/backend.md)
- Frontend page/data flow: [`Docs/frontend.md`](/Docs/frontend.md)
- Database schema and state shape: [`Docs/database.md`](/Docs/database.md)

High-level structure:
- **API routes** live under `server/api/**`
- **Domain services** live under `server/services/**` (pure, testable logic)
- **Session** is determined by `sid` cookie (HTTP-only)
- **Database** persists `Game` rows with `stateJson` holding authoritative game state
- **Records** persist finished game scores + duration

---

## Postman

Import `postman-collection.json` to hit the local API.

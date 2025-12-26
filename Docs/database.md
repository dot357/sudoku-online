## Environment

The project uses SQLite by default.
```
DATABASE_URL="file:./dev.db"
```

## Schema overview

### Game
| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `cuid()` primary key |
| `sid` | `String` | session owner (HTTP-only cookie) |
| `rank` | `String` | beginner/intermediate/hard/expert |
| `status` | `String` | in_progress/finished |
| `stateJson` | `Json` | authoritative game state |
| `createdAt` | `DateTime` | auto |
| `updatedAt` | `DateTime` | auto |

### Record
| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `cuid()` primary key |
| `gameId` | `String` | unique per finished game |
| `rank` | `String` | game rank at finish |
| `score` | `Int` | final score |
| `durationSec` | `Int` | elapsed seconds |
| `createdAt` | `DateTime` | auto |

## Game state JSON

The `stateJson` field stores the authoritative game state. See
`shared/types/sudoku.ts` for the canonical shape (`GameState`), including:
`solution`, `puzzle`, `given`, `current`, `score`, `errors`, `hintsUsed`,
and timing fields (`startedAt`, `pauseAccumulatedMs`, `pausedAt`).

## Migrations and tooling

- Migrations live under `prisma/migrations/`.
- Use `npm run prisma:studio` to inspect data locally.

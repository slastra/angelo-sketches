# Angelo's Sketches

A personal sketch gallery + admin dashboard for Angelo. Hand-drawn aesthetic on dot-grid paper, three layouts, click-to-zoom, plus a private dashboard for uploading, editing (crop + rotate), tagging, and reordering sketches.

## Stack

- Nuxt 4, Vue 3, TypeScript
- bun (runtime + package manager)
- bun:sqlite (single `.data/angelo.db`)
- sharp (resize / re-encode on upload + edit)
- vue-advanced-cropper (crop + rotate UI)
- @nuxt/ui, @nuxt/icon, lucide

## Local development

```bash
cp .env.example .env
# set APP_PASSWORD and a SESSION_SECRET (openssl rand -hex 32)
bun install
bun run dev
```

Visit `http://localhost:3000/` for the gallery, `/admin` for the dashboard (password from `.env`).

## Production

```bash
bun run build
bun --bun .output/server/index.mjs
```

The server uses `bun:sqlite`, so the runtime **must be bun** — do not run `node .output/server/index.mjs`.

## Deployment (Coolify + Nixpacks)

`nixpacks.toml` is included. Coolify will pick it up automatically.

Required environment variables (set them in Coolify, never commit them):

| Var | Notes |
| --- | --- |
| `APP_PASSWORD` | The single password for `/admin` |
| `SESSION_SECRET` | 32-byte hex (`openssl rand -hex 32`) — signs the session cookie |
| `PORT` | Provided by Coolify automatically |

**Persistent volume:** Mount a Coolify volume to `/app/.data`. This holds the SQLite db (`angelo.db`) and uploaded images (`uploads/<id>.<ext>`). Without it, every deploy wipes Angelo's sketches.

That's it — no external services, no DB to provision.

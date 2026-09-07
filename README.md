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
# set NUXT_APP_PASSWORD and a NUXT_SESSION_SECRET (openssl rand -hex 32)
bun install
bun run dev
```

Visit `http://localhost:3000/` for the gallery, `/admin` for the dashboard (password from `.env`).

## Production

```bash
bun run build
NUXT_APP_PASSWORD=... NUXT_SESSION_SECRET=... bun --bun .output/server/index.mjs
```

The server uses `bun:sqlite`, so the runtime **must be bun** — do not run `node .output/server/index.mjs`.

## Deployment (Coolify + Nixpacks)

`nixpacks.toml` is included. Coolify will pick it up automatically.

Required environment variables (set them in Coolify, never commit them):

| Var | Notes |
| --- | --- |
| `NUXT_APP_PASSWORD` | The single password for `/admin` |
| `NUXT_SESSION_SECRET` | 32-byte hex (`openssl rand -hex 32`) — signs the session cookie |
| `PORT` | Provided by Coolify automatically |

### How the env vars are read

Nuxt's `runtimeConfig` is resolved in two places, and the variable name decides which:

- **`NUXT_APP_PASSWORD` / `NUXT_SESSION_SECRET`** are read by the server **at runtime**. This is the
  reliable form: it works in dev, in `bun --bun .output/server/index.mjs`, and in Coolify regardless
  of whether the var is marked build-time or runtime.
- **`APP_PASSWORD` / `SESSION_SECRET`** (no prefix) are only read by `nuxt.config.ts` **at build time**
  and baked into the bundle. They work in dev (Nuxt loads `.env` before evaluating the config) and in
  Coolify *only if the var is available to the build*. Set as runtime-only, they are silently ignored
  and every login fails with "Wrong password".

The current Coolify app uses the unprefixed names marked as build-time vars, so it works — but it also
means changing the password requires a rebuild, not a restart. Prefer the `NUXT_` names for anything new.

**Persistent volume:** Mount a Coolify volume to `/app/.data`. This holds the SQLite db (`angelo.db`) and uploaded images (`uploads/<id>.<ext>`). Without it, every deploy wipes Angelo's sketches.

That's it — no external services, no DB to provision.

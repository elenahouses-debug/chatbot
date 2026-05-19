# Release Notes — v0.1.0

**Zero vendor lock-in release**

Date: 2026-05-19

## What's new

This is the first release of the forked project. It strips all Vercel-exclusive dependencies and replaces them with portable, self-hostable alternatives.

### Key changes

| Area | Before | After |
|------|--------|-------|
| AI Proxy | Vercel AI Gateway | Direct provider API keys (OpenAI-compatible) |
| File storage | Vercel Blob | Local filesystem / MinIO |
| Bot protection | BotID | Removed |
| Auth gateway | `AUTH_GATEWAY_URL` | Direct provider auth |
| Linter | Ultracite presets | Custom Biome config |
| Local dev | Vercel-only | Docker Compose (MinIO + PostgreSQL) |

### Provider support

- OpenAI (GPT-4.1, GPT-4o-mini, o3, o4-mini)
- Anthropic (Claude Sonnet 4, Haiku 3.5, Claude Opus 4)
- Google (Gemini 2.5 Pro, Gemini 2.5 Flash)
- DeepSeek (DeepSeek V3, DeepSeek R1, DeepSeek Chat)
- Kimi / Moonshot AI (Kimi k2.5, Kimi k2, Kimi k2-vl, Kimi k2-thinking)

### How to upgrade from v3.x

1. Clone the repository
2. Copy `.env.example` → `.env.local` and fill in your provider API keys
3. Run `docker compose -f docker-compose.local.yml up -d` for local MinIO + PostgreSQL
4. Run `pnpm install && pnpm run migrate && pnpm run dev`

## Known issues

- File uploads require MinIO or S3-compatible storage in production
- Image analysis models may need additional configuration depending on provider

## Upcoming

- 3D model generation (Blender headless in Docker)
- Plugin/module system for 3D backends
- Custom artifact for 3D preview

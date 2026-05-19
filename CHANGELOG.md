# Changelog

## [0.1.0] - 2026-05-19

### Zero vendor lock-in

This release removes all hard dependencies on Vercel-specific services, making the project fully self-hostable.

#### Breaking changes

- **Removed AI Gateway**: The Vercel AI Gateway integration has been removed. All provider authentication happens directly via API keys using standard OpenAI-compatible HTTP clients.
- **Removed Vercel Blob**: File storage migrated to local filesystem. For production, use Docker Compose with MinIO (S3-compatible).
- **Removed BotID**: Bot protection dependency eliminated.
- **Removed IS_DEMO / basepath / mfe**: Demo-specific configuration removed.
- **Environment variables restructured**: `.env.example` updated — `AUTH_GATEWAY_URL`, `BLOB_READ_WRITE_TOKEN`, and `BOT_ID` removed.

#### Features

- **Modular provider system**: Wrappers for OpenAI, Anthropic, Google Generative AI, DeepSeek, and Kimi (Moonshot AI). Each provider uses its own API key directly.
- **Dynamic model discovery**: Models are resolved at runtime from a centralized configuration.
- **Reasoning model support**: Anthropic Claude and Google Gemini reasoning models supported.
- **Docker Compose local stack**: `docker-compose.local.yml` with MinIO (S3-compatible storage) and PostgreSQL.
- **Custom Biome configuration**: Replaced ultracite presets with a focused set of lint rules.

#### Documentation

- README completely rewritten: local-first setup guide, no Vercel references, Docker Compose instructions, manual file storage configuration.

#### Full diff

See commit `de701c4`.

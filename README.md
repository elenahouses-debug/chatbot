<a href="#">
  <img alt="Chatbot" src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chatbot</h1>
</a>

<p align="center">
    Chatbot (formerly AI Chatbot) is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications. This fork removes all Vercel vendor lock-in for self-hosted deployments.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering
- [AI SDK](https://ai-sdk.dev/docs/introduction)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports any OpenAI-compatible provider (LM Studio, OpenAI, NVIDIA NIM, etc.)
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL
  - Save chat history and user data
  - Compatible with any PostgreSQL provider (local, cloud, etc.)
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication
- Zero vendor lock-in
  - No Vercel AI Gateway
  - No Vercel Blob
  - No Vercel Functions
  - No BotID
  - No Vercel OTel
  - No Vercel Analytics
  - Works with any hosting provider

## Model Providers

This template uses an OpenAI-compatible provider via the AI SDK. You can use any service that exposes an OpenAI-compatible API:

- **Local**: [LM Studio](http://lmstudio.ai) (default: `http://localhost:1234/v1`)
- **Cloud**: [NVIDIA NIM](https://integrate.api.nvidia.com/v1), [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), and many more

Configuration is done via environment variables in `.env.local`:

```env
OPENAI_COMPATIBLE_BASE_URL=http://localhost:1234/v1
OPENAI_COMPATIBLE_API_KEY=not-needed
OPENAI_COMPATIBLE_PROVIDER_NAME=lmstudio
CHAT_MODEL_ID=your-model-id
TITLE_MODEL_ID=your-title-model-id
```

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example).

> Note: You should not commit your `.env` file or it will expose secrets.

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io)
- [PostgreSQL](https://postgresql.org) 16+ (local or remote)
- Docker (optional, for local PostgreSQL via `docker-compose.local.yml`)

### Setup

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000).

## Deploy Your Own

### Build for production

```bash
pnpm build
```

The build produces a standalone output in `.next/standalone` that can be deployed without `node_modules`.

### Self-hosted deployment

Copy to your server:

```
.next/standalone/
.next/static/
public/
.env.production
```

Start with:

```bash
node server.js
```

It's recommended to put [Nginx](https://nginx.org) or another reverse proxy in front.

### Required environment variables in production

```env
AUTH_SECRET=...
POSTGRES_URL=postgres://user:password@host:5432/db
OPENAI_COMPATIBLE_BASE_URL=...
OPENAI_COMPATIBLE_API_KEY=...
OPENAI_COMPATIBLE_PROVIDER_NAME=...
CHAT_MODEL_ID=...
TITLE_MODEL_ID=...
```

Redis is optional — if `REDIS_URL` is not set, resumable streams are disabled automatically.

### Storage

For file uploads in production, consider:
- **Local storage** — works for single-server deployments (files stored in `public/uploads/`)
- **S3-compatible** — use [MinIO](https://min.io) or any S3 provider for distributed deployments

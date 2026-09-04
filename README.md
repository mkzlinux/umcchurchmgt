# WesleyLink

Connected church management for the United Methodist Church.

This repository currently contains the first visual prototype for the WesleyLink circuit workspace. It is a static, responsive preview using sample data only.

## Run locally

WesleyLink is now a Next.js application. Use the local-first workflow while building:

```bash
npm install
cp .env.example .env.local
npm run dev -- --hostname 0.0.0.0 --port 4173
```

Then open `http://localhost:4173`.

See `docs/LOCAL_DEVELOPMENT.md` for the development, staging, and production workflow.

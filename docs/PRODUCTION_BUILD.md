# WesleyLink production build

## Confirmed stack

- Vercel: web hosting and deployments
- Supabase: PostgreSQL, Auth, Realtime, Storage
- Optional Cloudflare later: DNS, CDN, and edge protection

## Current foundation

- `supabase/migrations/0001_wesleylink_foundation.sql` — relational schema and initial RLS policies
- `supabase/seed.sql` — safe sample Goromonzi Circuit data
- `.env.example` — environment variable contract
- `index.html` — visual product shell and workspace menu

## First live integration

1. Create a Supabase project.
2. Apply the migration in `supabase/migrations`.
3. Run `supabase/seed.sql` in a development project only.
4. Add environment variables from `.env.example` to Vercel.
5. Replace sample UI values with authenticated Supabase queries.
6. Add the Super Admin bootstrap flow; do not seed a real password in SQL.

## Security requirements

- Keep the Supabase service-role key server-side only.
- Use RLS on every church, member, finance, report, and workflow table.
- Do not hard-delete historical membership events.
- Lock approved reporting periods and create corrections as new audited versions.
- Keep production, staging, and local Supabase projects separate.

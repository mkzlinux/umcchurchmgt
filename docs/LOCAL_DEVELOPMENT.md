# WesleyLink local-first workflow

## Development environment

Use the local Next.js server while the product is being built. Vercel is not the active development environment yet.

```bash
npm install
cp .env.example .env.local
npm run dev -- --hostname 0.0.0.0 --port 4173
```

Fill `.env.local` with the development Supabase project values. Never commit `.env.local`.

## Development order

1. Run the Next.js app locally.
2. Use the Supabase development project only.
3. Apply migrations in order: `0001`, `0002`, `0003`.
4. Run the sample seed in the development project.
5. Test root login and onboarding.
6. Test circuit setup and permissions.
7. Test calendar, membership, finance, and reports locally.
8. Run `npm run build` before each milestone.
9. Deploy a Vercel preview only after the workflow is stable.
10. Create a separate production Supabase project before real data migration.

## Environment separation

| Environment | Frontend | Database | Data |
|---|---|---|---|
| Local | localhost / preview | Supabase development | Sample data |
| Staging | Vercel preview | Supabase staging | Sanitized test data |
| Production | Vercel production | Supabase production | Approved church data |

## Safe test sequence

- Create a test Auth user.
- Claim the first platform root.
- Register a test circuit.
- Add a church, preaching point, and section.
- Confirm `/root` and `/circuit/[id]` permissions.
- Confirm a non-root user cannot access `/root`.
- Verify that real member and finance data is not loaded until RLS tests pass.

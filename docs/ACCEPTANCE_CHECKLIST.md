# WesleyLink acceptance checklist

## Product requirements covered by the foundation

- [x] Circuit-first setup model
- [x] Churches, preaching points, and sections
- [x] Separate sections assigned to member records
- [x] Conditional transfer-in and transfer-out dates
- [x] Deceased status archives a member instead of deleting the record
- [x] Reporting periods with a July–June default
- [x] Opening and closing membership snapshots
- [x] Historical events are period-bound and not counted repeatedly
- [x] Carry-forward reporting model available
- [x] Committee objective, action, impact, outcome, and proposed dates
- [x] Council approval status and calendar publication fields
- [x] Pastor appointment history model
- [x] USD and ZWL stored separately
- [x] Realtime-ready submissions, calendar, and reporting-period tables
- [x] Role-based access foundation
- [x] Audit-friendly historical records

## UI checks

- [x] Splash screen
- [x] Workspace tile menu
- [x] Return to menu from WesleyLink mark
- [x] Horizontal navigation
- [x] No visible sidebar
- [x] White premium workspace background
- [x] Consistent card corners
- [x] Responsive mobile layout
- [x] Membership, attendance, finance, calendar, and ZEAC dashboard areas

## Before production launch

- [ ] Create separate Supabase development, staging, and production projects
- [ ] Apply migration and verify every RLS policy with test users
- [ ] Add real authentication and Super Admin bootstrap
- [ ] Replace sample dashboard values with database queries
- [ ] Add server-side report generation and private document storage
- [ ] Add email provider and notification preferences
- [ ] Import and reconcile paper records
- [ ] Add automated unit, integration, and end-to-end tests
- [ ] Configure backups, monitoring, rate limits, and incident recovery
- [ ] Perform a privacy review before loading personal or financial data

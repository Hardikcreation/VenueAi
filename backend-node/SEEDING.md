# Demo Seed Data

Run the demo seeder from `backend-node`:

```bash
npm run seed:demo
```

What it creates:

- 10 users
- 10 vendors
- 20 venues
- 20 bookings

Notes:

- Seeded accounts use emails starting with `seed2026.` so the script can safely replace only its own demo data on re-run.
- Each vendor is assigned a primary category in the generated report, and two venues are created per vendor.
- The script writes credentials, ids, and seeded entity summaries to `backend-node/seed-demo-report.json`.

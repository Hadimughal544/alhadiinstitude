# AlHadiInstitude

Full-stack Next.js platform for **AlHadiInstitude** — country-gated pricing, Holy Quran tutors, online tuition, IT services (learn + build), lead capture, dark mode, and an admin panel.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + Neon PostgreSQL
- NextAuth (credentials) for admin
- `next-themes` dark mode

## Setup

1. Create a Neon database (recommended name: `alhadi`) so it does not share tables with other projects.

2. Copy env file and fill values:

```bash
cp .env.example .env
```

Set:

- `DATABASE_URL` — Neon pooled connection string
- `AUTH_SECRET` — random secret (`openssl rand -base64 32`)
- `AUTH_URL` — `http://localhost:3000`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — seed admin login

3. Install and prepare the database:

```bash
npm install
npx prisma db push
npm run db:seed
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Public site starts with the country selector.
- Admin: [http://localhost:3000/login](http://localhost:3000/login)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema to Neon |
| `npm run db:seed` | Seed countries, services, plans, prices, admin |
| `npm run db:studio` | Prisma Studio |

## Services

1. **Holy Quran Tutors** — Tajweed, Nazra, Hifz, demo booking (inspired by DeenlyTutors)
2. **Online Tuition** — subject tutoring packages (inspired by MyTutor)
3. **IT Services** — train and deliver web, app, design, marketing, AI automations

Prices are stored per currency and shown from the selected country cookie.

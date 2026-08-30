# Al-Hadi Institute

Full-stack Next.js platform for **Al-Hadi Institute** — country-gated pricing, Holy Quran tutors, online tuition, IT services, lead capture, blog CMS, and role-based admin, teacher, and student portals.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + Neon PostgreSQL
- NextAuth (credentials) for admin, teacher, and student login
- Google Calendar API for automatic Google Meet class links
- Dark mode via a local theme provider

## Setup

1. Create a Neon database (recommended name: `alhadi`) so it does not share tables with other projects.

2. Copy env file and fill values:

```bash
cp .env.example .env
```

Set:

- `DATABASE_URL` — Neon pooled connection string
- `AUTH_SECRET` — random secret (`openssl rand -base64 32`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — seed admin login
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` — for Meet links

Auth.js infers the current origin. In production, do not configure
`AUTH_URL` or `NEXTAUTH_URL` as `http://localhost:3000`. Remove those
variables or set both to your deployed HTTPS origin.

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
- Sign in: [http://localhost:3000/login](http://localhost:3000/login)
  - Admin → `/admin`
  - Teacher → `/teacher`
  - Student → `/student`

Teachers and students are created by an admin. There is no public signup.

## Google Meet links

Each teacher is the Meet host. The event is created on that teacher’s Google Calendar.

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project.
2. Enable the **Google Calendar API**.
3. Configure the OAuth consent screen and create **Web application** credentials.
4. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/teacher/google/callback`
   - Production: `https://your-domain.com/api/teacher/google/callback`
5. Put `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_TEACHER_REDIRECT_URI` in `.env`.
6. Each teacher signs in → **Account** → **Connect Google Calendar**.
7. Admin then creates the lecture. Students are not emailed the Meet link.

Join button timing (institute timezone):

- Teacher: 5 minutes before start
- Student: at start time
- After end time the link is hidden again

## Vercel

This is a standard Next.js app. After connecting the repo:

1. Set env vars on Vercel: `DATABASE_URL`, `AUTH_SECRET`, Cloudinary keys, `NEXT_PUBLIC_SITE_URL`, and the three `GOOGLE_*` values.
2. Set `GOOGLE_TEACHER_REDIRECT_URI` to `https://<your-domain>/api/teacher/google/callback`.
3. Do **not** set `AUTH_URL` / `NEXTAUTH_URL` to localhost.
4. After the first deploy, run `npx prisma db push` (and seed if needed) against Neon.
5. Add the production teacher redirect URI in Google Cloud. Each teacher then connects Google from `/teacher/account`.

No cron job is required. Meet links are created when a lecture is saved and reused every week.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema to Neon |
| `npm run db:seed` | Seed countries, services, plans, prices, admin |
| `npm run db:studio` | Prisma Studio |

## Services

1. **Holy Quran Tutors** — Tajweed, Nazra, Hifz, demo booking
2. **Online Tuition** — subject tutoring packages
3. **IT Services** — train and deliver web, app, design, marketing, AI automations

Prices are stored per currency and shown from the selected country cookie.

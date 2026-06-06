# Smart Internship Intelligence Portal

A complete local full-stack Next.js + React + Tailwind CSS portal using SQLite and Excel import. Built from the uploaded UI/UX prototype and Excel internship dashboard.

## Features

- Public LMS/CMS style dashboard
- Internship Explorer with search and filters
- Student sign up/login, profile, smart matching score, apply button, My Applications
- Company registration/login, internship submission, pending/approved/rejected tracking
- Admin login, Excel upload/import, view/search/edit/delete records, approve/reject, feature/unfeature, export CSV/Excel, student/application views
- SQLite local database seeded from the provided Excel dashboard
- Responsive desktop/mobile UI
- Prepared for Vercel deployment; SQLite is for local testing only. Use Supabase for production persistence.

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

Open: `http://localhost:3000`

The app auto-creates and seeds the SQLite database on first API request. You can also run:

```bash
npm run db:seed
```

## Default Admin Login

- Email: `admin@siportal.local`
- Password: `admin12345`

Change these in `.env` before public use.

## Project Structure

```text
app/                  Next.js app pages and API routes
components/           Shared React components
lib/                  Database, auth, matching, import/export helpers
data/                 Excel sample, seed JSON, local SQLite DB after running
scripts/seed.js       Manual seed command
```

## Excel Import

Admin Portal -> Upload Excel -> select `.xlsx` or `.csv` -> Import.
The parser supports the uploaded dashboard columns such as Internship Title, Company / Organization Name, Field / Domain, Required Skills, City, Country, Internship Mode, Paid or Unpaid, Deadline, Direct Apply Link, Verified Status, and Application Status.

## Local SQLite Notes

SQLite works perfectly for local demo/testing. On Vercel, the file system is not persistent, so uploaded/imported data can reset. For live deployment, migrate to Supabase.

## Vercel Deployment

1. Push this folder to GitHub.
2. Import repo in Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.
5. For production data, use Version 2 Supabase steps below.

## Version 2: Supabase Migration Plan

1. Create a Supabase project.
2. Create tables: `users`, `internships`, `applications` with the same columns in `lib/db.js`.
3. Replace `better-sqlite3` queries with Supabase client calls.
4. Store `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
5. Move file import API to insert rows into Supabase instead of SQLite.
6. Use Supabase Auth later if you want email verification and password reset.

## Version 3 Roadmap

- AI matching and semantic recommendation
- CV parser and automatic skill extraction
- Email alerts for deadlines and application updates
- Audit logs and department admin roles
- Google Search Console, sitemap, public SEO pages

# Service Funnel

A single-page service funnel website with authentication, coupons, and admin (Phase 1 complete).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **MongoDB** (Atlas) for users, services, coupons
- **NextAuth v5** (credentials, JWT sessions)
- **React Hook Form + Zod** for forms and validation
- **Framer Motion** for animations
- **Lucide React** for icons

## Setup

1. **Install dependencies** (ensure you have enough disk space):

   ```bash
   cd service-funnel && npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in:

   - `MONGODB_URI` – MongoDB connection string (required for auth and seed)
   - `AUTH_SECRET` – run `npx auth secret` or `openssl rand -base64 32`
   - `AUTH_URL` – e.g. `http://localhost:3000`
   - `ADMIN_EMAIL` (optional) – email that gets `admin` role on signup

3. **Seed the database** (optional):

   ```bash
   npm run db:seed
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Phase 1 (Done)

- Next.js + TypeScript + Tailwind + path aliases + env validation
- MongoDB connection, User/Service/Coupon schemas and types, seed script
- NextAuth v5 credentials, signup API, login/signup UI
- Public home, login, signup; protected `/admin` placeholder

## Project root

The app lives in the `service-funnel` folder. The parent folder contains `task.md` and `service_funnel_website_project_details.md`.

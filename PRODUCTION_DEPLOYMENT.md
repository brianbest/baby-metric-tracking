# Production Deployment Guide

This guide will help you deploy the Baby Tracker database schema and seed data to your production Supabase instance.

## Prerequisites

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install the Supabase CLI (already installed in this workspace)
3. **Environment Variables**: Your Supabase project reference and credentials

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - Project URL (format: `https://your-project-ref.supabase.co`)
   - Project Reference ID (the part before `.supabase.co`)
   - `anon` public key
   - `service_role` secret key (if needed)

## Step 2: Deploy Database Schema

### Option A: Using Supabase CLI (Recommended)

```bash
# Navigate to the project root
cd /workspace

# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to production
supabase db push

# Seed the database with sample data
supabase db seed
```

### Option B: Manual SQL Execution

If the CLI approach doesn't work, you can manually run the SQL files:

1. Go to your Supabase Dashboard → **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001-init.sql`
3. Run the query
4. Copy and paste the contents of `supabase/migrations/002-rls-policies.sql`
5. Run the query
6. Copy and paste the contents of `supabase/seed.sql`
7. Run the query

## Step 3: Update Environment Variables

Create a `.env` file in your project root (or update your hosting platform environment variables):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Update Application Configuration

The application will automatically use production credentials when the environment variables are set. The `packages/web/src/lib/supabase.ts` file is already configured to:

1. Use production URLs when `VITE_SUPABASE_URL` is set
2. Fall back to local development when environment variables are missing

## Step 5: Verify Deployment

1. **Check Tables**: Go to Supabase Dashboard → **Table Editor** and verify these tables exist:
   - `baby`
   - `user`
   - `entry`
   - `caregiver_relationship`

2. **Check Policies**: Go to **Authentication** → **Policies** and verify RLS policies are enabled

3. **Check Sample Data**: You should see sample babies, users, and entries in the tables

## Step 6: Deploy Frontend

Deploy your frontend application to your hosting platform (Vercel, Netlify, etc.) with the production environment variables.

## Troubleshooting

### Authentication Issues
- Ensure Row Level Security policies are enabled
- Check that your `anon` key has the correct permissions
- Verify users are properly authenticated before accessing data

### Missing Tables
If tables are missing, manually run the migration files in order:
1. `001-init.sql` (creates tables)
2. `002-rls-policies.sql` (sets up security)

### Seeding Issues
If sample data isn't appearing:
- Check that foreign key relationships are satisfied
- Ensure UUIDs in `seed.sql` don't conflict with existing data
- Run seed queries manually in SQL Editor

### Environment Variables
For different hosting platforms:

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Netlify:**
Add environment variables in Site Settings → Environment Variables

**Local Development:**
Copy `.env.example` to `.env` and update with production values

## Security Notes

- RLS (Row Level Security) is enabled on all tables
- Users can only access babies they're associated with via `caregiver_relationship`
- All database operations require proper authentication
- The `service_role` key should never be exposed to the frontend

## Next Steps

After successful deployment:
1. Test user registration and login
2. Create a baby profile
3. Add some entries (feed, sleep, diaper)
4. Verify data persistence and security
5. Set up any additional authentication providers (Google, Apple)

For ongoing maintenance, use migrations for schema changes:
```bash
supabase migration new your_migration_name
# Edit the new migration file
supabase db push
```
#!/bin/bash

# Deploy production database schema and seed data
# Usage: ./scripts/deploy-production.sh

set -e

echo "🚀 Deploying Baby Tracker to Production..."

# Check if required environment variables are set
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set:"
    echo "  SUPABASE_PROJECT_REF=your-project-ref"
    echo "  SUPABASE_DB_PASSWORD=your-db-password"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

echo "📦 Linking to Supabase project..."
supabase link --project-ref "$SUPABASE_PROJECT_REF"

echo "🗄️  Pushing database migrations..."
supabase db push

echo "🌱 Seeding database with sample data..."
supabase db seed

echo "🔧 Setting up Row Level Security policies..."
# Enable RLS on all tables
psql "postgresql://postgres:$SUPABASE_DB_PASSWORD@db.$SUPABASE_PROJECT_REF.supabase.co:5432/postgres" << 'EOF'
-- Enable RLS on all tables
ALTER TABLE public.baby ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_relationship ENABLE ROW LEVEL SECURITY;

-- Policy for baby table - caregivers can access their babies
CREATE POLICY "Caregivers can view their babies" ON public.baby
    FOR ALL USING (
        id IN (
            SELECT baby_id FROM public.caregiver_relationship 
            WHERE caregiver_id = auth.uid()
        )
    );

-- Policy for user table - users can view their own record
CREATE POLICY "Users can view own profile" ON public.user
    FOR ALL USING (id = auth.uid());

-- Policy for caregiver_relationship - users can view their own relationships
CREATE POLICY "Users can view own relationships" ON public.caregiver_relationship
    FOR ALL USING (caregiver_id = auth.uid());

-- Entry policy is already defined in migration
EOF

echo "✅ Production deployment complete!"
echo ""
echo "🔗 Your Supabase project: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF"
echo "📊 API URL: https://$SUPABASE_PROJECT_REF.supabase.co"
echo ""
echo "Next steps:"
echo "1. Update your production environment variables:"
echo "   VITE_SUPABASE_URL=https://$SUPABASE_PROJECT_REF.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=(get from Supabase dashboard)"
echo "2. Deploy your frontend application"
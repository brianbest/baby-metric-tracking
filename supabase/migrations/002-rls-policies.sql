-- Enable Row Level Security on all tables
ALTER TABLE public.baby ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_relationship ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS baby_owners ON public.entry;
DROP POLICY IF EXISTS "Caregivers can view their babies" ON public.baby;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user;
DROP POLICY IF EXISTS "Users can view own relationships" ON public.caregiver_relationship;

-- Policies for baby table
CREATE POLICY "Caregivers can view their babies" ON public.baby
    FOR ALL USING (
        id IN (
            SELECT baby_id FROM public.caregiver_relationship 
            WHERE caregiver_id = auth.uid()
        )
    );

-- Policies for user table
CREATE POLICY "Users can view own profile" ON public.user
    FOR ALL USING (id = auth.uid());

-- Policies for entry table
CREATE POLICY "Caregivers can manage entries for their babies" ON public.entry
    FOR ALL USING (
        baby_id IN (
            SELECT baby_id FROM public.caregiver_relationship 
            WHERE caregiver_id = auth.uid()
        )
    );

-- Policies for caregiver_relationship table
CREATE POLICY "Users can view own relationships" ON public.caregiver_relationship
    FOR SELECT USING (caregiver_id = auth.uid());

CREATE POLICY "Users can insert own relationships" ON public.caregiver_relationship
    FOR INSERT WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Users can update own relationships" ON public.caregiver_relationship
    FOR UPDATE USING (caregiver_id = auth.uid());

CREATE POLICY "Users can delete own relationships" ON public.caregiver_relationship
    FOR DELETE USING (caregiver_id = auth.uid());
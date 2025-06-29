-- Baby Table
CREATE TABLE IF NOT EXISTS public.baby (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    birth_date date NOT NULL,
    preferred_units text CHECK (preferred_units IN ('metric', 'imperial')),
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now()),
    deleted_at timestamp with time zone
);

-- User Table
CREATE TABLE IF NOT EXISTS public.user (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_provider text NOT NULL,
    role text,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    updated_at timestamp with time zone DEFAULT timezone('utc', now()),
    deleted_at timestamp with time zone
);

-- Entry Table
CREATE TABLE IF NOT EXISTS public.entry (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id uuid REFERENCES public.baby(id) ON DELETE CASCADE,
    type text CHECK (type IN ('feed', 'diaper', 'sleep')),
    payload_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc', now()),
    created_by uuid REFERENCES public.user(id),
    deleted_at timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS entry_unique_idx
    ON public.entry (baby_id, created_at DESC);

-- Caregiver Relationship Table
CREATE TABLE IF NOT EXISTS public.caregiver_relationship (
    caregiver_id uuid REFERENCES public.user(id),
    baby_id uuid REFERENCES public.baby(id),
    PRIMARY KEY (caregiver_id, baby_id)
);

-- Sample Row-Level Security Policy
CREATE POLICY baby_owners
    ON public.entry
    USING (exists (select 1 from public.caregiver_relationship where caregiver_id = auth.uid() and baby_id = entry.baby_id));


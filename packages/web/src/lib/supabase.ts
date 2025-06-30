import { createClient } from '@supabase/supabase-js';

// For production/cloud environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types for our database schema
export interface Database {
  public: {
    Tables: {
      baby: {
        Row: {
          id: string;
          name: string;
          birth_date: string;
          preferred_units: 'metric' | 'imperial';
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          birth_date: string;
          preferred_units: 'metric' | 'imperial';
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          birth_date?: string;
          preferred_units?: 'metric' | 'imperial';
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user: {
        Row: {
          id: string;
          auth_provider: string;
          role: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          auth_provider: string;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          auth_provider?: string;
          role?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      entry: {
        Row: {
          id: string;
          baby_id: string;
          type: 'feed' | 'diaper' | 'sleep';
          payload_json: Record<string, any>;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          baby_id: string;
          type: 'feed' | 'diaper' | 'sleep';
          payload_json: Record<string, any>;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          baby_id?: string;
          type?: 'feed' | 'diaper' | 'sleep';
          payload_json?: Record<string, any>;
          created_by?: string | null;
          deleted_at?: string | null;
        };
      };
      caregiver_relationship: {
        Row: {
          caregiver_id: string;
          baby_id: string;
        };
        Insert: {
          caregiver_id: string;
          baby_id: string;
        };
        Update: {
          caregiver_id?: string;
          baby_id?: string;
        };
      };
    };
  };
}

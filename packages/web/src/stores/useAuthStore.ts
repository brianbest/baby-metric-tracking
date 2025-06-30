import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { dataService } from '../lib/dataService';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // Actions
  signInWithEmail: (email: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,

      signInWithEmail: async (email: string) => {
        set({ loading: true, error: null });

        try {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) throw error;

          // Don't set user/session here - they'll be set by the auth state change listener
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message, loading: false });
        }
      },

      signInWithOAuth: async (provider: 'google' | 'apple') => {
        set({ loading: true, error: null });

        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) throw error;
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message, loading: false });
        }
      },

      signOut: async () => {
        set({ loading: true, error: null });

        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({ user: null, session: null, loading: false });

          // Clear user from data service
          dataService.setUser(null);
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message, loading: false });
        }
      },

      clearError: () => set({ error: null }),

      initialize: async () => {
        set({ loading: true });

        try {
          // Get initial session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();
          if (error) throw error;

          set({
            session,
            user: session?.user || null,
            loading: false,
          });

          // Update data service with user
          dataService.setUser(session?.user || null);

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);

            set({
              session,
              user: session?.user || null,
              loading: false,
            });

            // Create user record in our database if it doesn't exist
            if (session?.user && event === 'SIGNED_IN') {
              await createUserRecord(session.user);
            }
          });
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Helper function to create user record
async function createUserRecord(user: User) {
  try {
    const { error } = await supabase.from('user').upsert({
      id: user.id,
      auth_provider: user.app_metadata?.provider || 'email',
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Failed to create user record:', error);
    }
  } catch (error) {
    console.warn('Error creating user record:', error);
  }
}

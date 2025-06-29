import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Baby } from '@baby-tracker/shared';
import * as db from '@baby-tracker/shared/db';

interface BabyState {
  babies: Baby[];
  activeBabyId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface BabyActions {
  loadBabies: () => Promise<void>;
  addBaby: (babyData: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Baby>;
  updateBaby: (id: string, updates: Partial<Baby>) => Promise<void>;
  deleteBaby: (id: string) => Promise<void>;
  setActiveBaby: (id: string | null) => void;
  getActiveBaby: () => Baby | null;
  createDefaultBaby: () => Promise<Baby>;
}

type BabyStore = BabyState & BabyActions;

export const useBabyStore = create<BabyStore>()(
  persist(
    (set, get) => ({
      // State
      babies: [],
      activeBabyId: null,
      isLoading: false,
      error: null,

      // Actions
      loadBabies: async () => {
        set({ isLoading: true, error: null });
        try {
          const babies = await db.getAllBabies();

          // If no babies exist, create a default one for Phase 1
          if (babies.length === 0) {
            const defaultBaby = await get().createDefaultBaby();
            set({ babies: [defaultBaby], activeBabyId: defaultBaby.id, isLoading: false });
          } else {
            set({ babies, isLoading: false });

            // Auto-select first baby if none selected
            const { activeBabyId } = get();
            if (!activeBabyId && babies.length > 0) {
              set({ activeBabyId: babies[0].id });
            }
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load babies',
            isLoading: false,
          });
        }
      },

      addBaby: async (babyData) => {
        set({ isLoading: true, error: null });
        try {
          const baby = await db.createBaby(babyData);
          set((state) => ({
            babies: [...state.babies, baby],
            activeBabyId: state.activeBabyId || baby.id, // Set as active if first baby
            isLoading: false,
          }));
          return baby;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add baby',
            isLoading: false,
          });
          throw error;
        }
      },

      updateBaby: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          await db.updateBaby(id, updates);
          set((state) => ({
            babies: state.babies.map((baby) =>
              baby.id === id ? { ...baby, ...updates, updatedAt: new Date() } : baby
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update baby',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteBaby: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await db.deleteBaby(id);
          set((state) => ({
            babies: state.babies.filter((baby) => baby.id !== id),
            activeBabyId: state.activeBabyId === id ? null : state.activeBabyId,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete baby',
            isLoading: false,
          });
          throw error;
        }
      },

      setActiveBaby: (id) => {
        set({ activeBabyId: id });
      },

      getActiveBaby: () => {
        const { babies, activeBabyId } = get();
        return babies.find((baby) => baby.id === activeBabyId) || null;
      },

      createDefaultBaby: async () => {
        const now = new Date();
        const defaultBabyData = {
          name: 'Baby',
          birthDate: now, // Use current date as placeholder
          preferredUnits: 'metric' as const,
        };

        return await db.createBaby(defaultBabyData);
      },
    }),
    {
      name: 'baby-store',
      partialize: (state) => ({
        activeBabyId: state.activeBabyId,
      }),
    }
  )
);

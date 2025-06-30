import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Baby } from '@baby-tracker/shared';
import { dataService } from '../lib/dataService';

interface BabyState {
  babies: Baby[];
  selectedBabyId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBabies: () => Promise<void>;
  createBaby: (baby: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  selectBaby: (id: string | null) => void;
  getSelectedBaby: (babies: Baby[]) => Baby | null;
  getActiveBaby: () => Baby | null;
}

export const useBabyStore = create<BabyState>()(
  persist(
    (set, get) => ({
      babies: [],
      selectedBabyId: null,
      isLoading: false,
      error: null,

      loadBabies: async () => {
        set({ isLoading: true, error: null });
        try {
          const babies = await dataService.getBabies();
          set({ babies, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load babies',
            isLoading: false,
          });
        }
      },

      createBaby: async (baby) => {
        set({ isLoading: true, error: null });
        try {
          const newBaby = await dataService.createBaby(baby);
          const { babies } = get();
          set({
            babies: [...babies, newBaby],
            isLoading: false,
            selectedBabyId: newBaby.id, // Auto-select the new baby
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create baby',
            isLoading: false,
          });
        }
      },

      selectBaby: (id) => {
        set({ selectedBabyId: id });
      },

      getSelectedBaby: (babies) => {
        const { selectedBabyId } = get();
        return babies.find((baby) => baby.id === selectedBabyId) || null;
      },

      getActiveBaby: () => {
        const { babies, selectedBabyId } = get();
        return babies.find((baby) => baby.id === selectedBabyId) || null;
      },
    }),
    {
      name: 'baby-storage',
      partialize: (state) => ({
        selectedBabyId: state.selectedBabyId,
        babies: state.babies,
      }),
    }
  )
);

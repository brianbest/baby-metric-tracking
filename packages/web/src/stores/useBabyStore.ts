import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Baby } from '@baby-tracker/shared';

interface BabyState {
  selectedBabyId: string | null;
  
  // Actions
  selectBaby: (id: string | null) => void;
  getSelectedBaby: (babies: Baby[]) => Baby | null;
}

export const useBabyStore = create<BabyState>()(
  persist(
    (set, get) => ({
      selectedBabyId: null,

      selectBaby: (id) => {
        set({ selectedBabyId: id });
      },

      getSelectedBaby: (babies) => {
        const { selectedBabyId } = get();
        return babies.find((baby) => baby.id === selectedBabyId) || null;
      },
    }),
    {
      name: 'baby-storage',
      partialize: (state) => ({ selectedBabyId: state.selectedBabyId }),
    }
  )
);

import { create } from 'zustand';
import type { Entry } from '@baby-tracker/shared';

interface EntryState {
  selectedEntryId: string | null;
  
  // Actions
  selectEntry: (id: string | null) => void;
  getSelectedEntry: (entries: Entry[]) => Entry | null;
  getEntriesByType: (entries: Entry[], type: Entry['type']) => Entry[];
  getLastEntry: (entries: Entry[], type?: Entry['type']) => Entry | null;
  getEntriesForDate: (entries: Entry[], date: Date) => Entry[];
}

export const useEntryStore = create<EntryState>()((set, get) => ({
  selectedEntryId: null,

  selectEntry: (id) => {
    set({ selectedEntryId: id });
  },

  getSelectedEntry: (entries) => {
    const { selectedEntryId } = get();
    return entries.find((entry) => entry.id === selectedEntryId) || null;
  },

  getEntriesByType: (entries, type) => {
    return entries.filter((entry) => entry.type === type);
  },

  getLastEntry: (entries, type) => {
    const filteredEntries = type ? entries.filter((entry) => entry.type === type) : entries;
    return filteredEntries.length > 0 ? filteredEntries[0] : null;
  },

  getEntriesForDate: (entries, date) => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return entries.filter((entry) => {
      const entryDate = new Date(
        entry.timestamp.getFullYear(),
        entry.timestamp.getMonth(),
        entry.timestamp.getDate()
      );
      return entryDate.getTime() === targetDate.getTime();
    });
  },
}));

import { create } from 'zustand';
import type { Entry, CreateEntry } from '@baby-tracker/shared';
import { dataService } from '../lib/dataService';

interface EntryState {
  todayEntries: Entry[];
  isLoading: boolean;

  selectedEntryId: string | null;

  // Actions
  selectEntry: (id: string | null) => void;
  getSelectedEntry: (entries: Entry[]) => Entry | null;
  getEntriesByType: (entries: Entry[], type: Entry['type']) => Entry[];
  getLastEntry: (entries: Entry[], type?: Entry['type']) => Entry | null;
  getEntriesForDate: (entries: Entry[], date: Date) => Entry[];
  loadTodayEntries: (babyId: string) => Promise<void>;
  addEntry: (entry: CreateEntry) => Promise<void>;
  getStats: (
    babyId: string,
    date: Date
  ) => { lastFeed: Date | null; lastDiaper: Date | null; lastSleep: Date | null };
}

export const useEntryStore = create<EntryState>()((set, get) => ({
  todayEntries: [],
  isLoading: false,
  selectedEntryId: null,

  loadTodayEntries: async (babyId) => {
    set({ isLoading: true });
    try {
      const entries = await dataService.getEntries(babyId);
      set({ todayEntries: entries, isLoading: false });
    } catch (error) {
      console.error('Failed to load today entries:', error);
      set({ isLoading: false });
    }
  },

  addEntry: async (entry) => {
    try {
      const newEntry = await dataService.createEntry(entry);
      const { todayEntries } = get();
      set({ todayEntries: [newEntry, ...todayEntries] });
    } catch (error) {
      console.error('Failed to add entry:', error);
      throw error; // Re-throw so components can handle the error
    }
  },

  getStats: (babyId, date) => {
    const { todayEntries } = get();
    const entriesForToday = todayEntries.filter((entry) => entry.babyId === babyId);

    const lastFeed =
      entriesForToday.filter((entry) => entry.type === 'feed').slice(-1)[0]?.timestamp || null;
    const lastDiaper =
      entriesForToday.filter((entry) => entry.type === 'diaper').slice(-1)[0]?.timestamp || null;
    const lastSleep =
      entriesForToday.filter((entry) => entry.type === 'sleep').slice(-1)[0]?.timestamp || null;

    return {
      lastFeed,
      lastDiaper,
      lastSleep,
    };
  },

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

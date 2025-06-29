import { create } from 'zustand';
import type { Entry, CreateEntry, DashboardStats } from '@baby-tracker/shared';
import * as db from '@baby-tracker/shared/db';
import { startOfDay, endOfDay } from 'date-fns';

interface EntryState {
  entries: Entry[];
  todayEntries: Entry[];
  isLoading: boolean;
  error: string | null;
  lastEntry: Entry | null;
}

interface EntryActions {
  loadEntries: (babyId: string, date?: Date) => Promise<void>;
  loadTodayEntries: (babyId: string) => Promise<void>;
  addEntry: (entry: CreateEntry) => Promise<Entry>;
  updateEntry: (id: string, updates: Partial<Entry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getStats: (babyId: string, date?: Date) => DashboardStats;
  repeatLastEntry: () => Promise<Entry | null>;
  endSleep: (sleepEntryId: string) => Promise<void>;
}

type EntryStore = EntryState & EntryActions;

export const useEntryStore = create<EntryStore>((set, get) => ({
  // State
  entries: [],
  todayEntries: [],
  isLoading: false,
  error: null,
  lastEntry: null,

  // Actions
  loadEntries: async (babyId: string, date = new Date()) => {
    set({ isLoading: true, error: null });
    try {
      const startDate = startOfDay(date);
      const endDate = endOfDay(date);
      const entries = await db.getEntriesByDateRange(babyId, startDate, endDate);
      
      set({ 
        entries,
        todayEntries: date.toDateString() === new Date().toDateString() ? entries : get().todayEntries,
        lastEntry: entries.length > 0 ? entries[entries.length - 1] : null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load entries',
        isLoading: false 
      });
    }
  },

  loadTodayEntries: async (babyId: string) => {
    const today = new Date();
    await get().loadEntries(babyId, today);
  },

  addEntry: async (entryData) => {
    set({ isLoading: true, error: null });
    try {
      const entry = await db.createEntry(entryData);
      
      set(state => {
        const newEntries = [...state.entries, entry].sort((a, b) => 
          a.timestamp.getTime() - b.timestamp.getTime()
        );
        
        const isToday = entry.timestamp.toDateString() === new Date().toDateString();
        const newTodayEntries = isToday 
          ? [...state.todayEntries, entry].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          : state.todayEntries;

        return {
          entries: newEntries,
          todayEntries: newTodayEntries,
          lastEntry: entry,
          isLoading: false
        };
      });
      
      return entry;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add entry',
        isLoading: false 
      });
      throw error;
    }
  },

  updateEntry: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await db.updateEntry(id, updates);
      
      set(state => ({
        entries: state.entries.map(entry => 
          entry.id === id ? { ...entry, ...updates } as Entry : entry
        ),
        todayEntries: state.todayEntries.map(entry => 
          entry.id === id ? { ...entry, ...updates } as Entry : entry
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update entry',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.deleteEntry(id);
      
      set(state => ({
        entries: state.entries.filter(entry => entry.id !== id),
        todayEntries: state.todayEntries.filter(entry => entry.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete entry',
        isLoading: false 
      });
      throw error;
    }
  },

  getStats: (babyId: string, date = new Date()): DashboardStats => {
    const { entries } = get();
    const targetDate = date.toDateString();
    const dayEntries = entries.filter(entry => 
      entry.babyId === babyId && entry.timestamp.toDateString() === targetDate
    );

    const feedEntries = dayEntries.filter(entry => entry.type === 'feed');
    const sleepEntries = dayEntries.filter(entry => entry.type === 'sleep');
    const diaperEntries = dayEntries.filter(entry => entry.type === 'diaper');

    const totalSleep = sleepEntries.reduce((total, entry) => {
      if (entry.type === 'sleep' && entry.payload.duration) {
        return total + entry.payload.duration;
      }
      return total;
    }, 0);

    return {
      totalFeeds: feedEntries.length,
      totalSleep,
      lastFeed: feedEntries.length > 0 ? feedEntries[feedEntries.length - 1].timestamp : undefined,
      lastSleep: sleepEntries.length > 0 ? sleepEntries[sleepEntries.length - 1].timestamp : undefined,
      lastDiaper: diaperEntries.length > 0 ? diaperEntries[diaperEntries.length - 1].timestamp : undefined,
    };
  },

  repeatLastEntry: async () => {
    const { lastEntry } = get();
    if (!lastEntry) return null;

    const newEntry: CreateEntry = {
      ...lastEntry,
      timestamp: new Date(),
    };

    return await get().addEntry(newEntry);
  },

  endSleep: async (sleepEntryId: string) => {
    const { entries } = get();
    const sleepEntry = entries.find(entry => entry.id === sleepEntryId);
    
    if (!sleepEntry || sleepEntry.type !== 'sleep') {
      throw new Error('Sleep entry not found');
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - sleepEntry.payload.startTime.getTime()) / (1000 * 60));

    await get().updateEntry(sleepEntryId, {
      payload: {
        ...sleepEntry.payload,
        endTime,
        duration,
      },
    });
  },
})); 
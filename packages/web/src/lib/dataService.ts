import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { db, entryToDBEntry, dbEntryToEntry, babyToDBBaby, dbBabyToBaby } from '@baby-tracker/shared/db';
import type { Baby, Entry, CreateEntry } from '@baby-tracker/shared';

export interface DataService {
  // Baby operations
  getBabies(): Promise<Baby[]>;
  createBaby(baby: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>): Promise<Baby>;
  updateBaby(id: string, updates: Partial<Baby>): Promise<Baby>;
  deleteBaby(id: string): Promise<void>;

  // Entry operations
  getEntries(babyId: string, limit?: number): Promise<Entry[]>;
  createEntry(entry: CreateEntry): Promise<Entry>;
  updateEntry(id: string, updates: Partial<Entry>): Promise<Entry>;
  deleteEntry(id: string): Promise<void>;

  // Sync operations
  syncData(): Promise<void>;
  getConnectionStatus(): boolean;
}

class HybridDataService implements DataService {
  private user: User | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncData().catch(console.error);
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  setUser(user: User | null) {
    this.user = user;
  }

  getConnectionStatus(): boolean {
    return this.isOnline && this.user !== null;
  }

  async getBabies(): Promise<Baby[]> {
    if (this.getConnectionStatus()) {
      try {
        const { data, error } = await supabase
          .from('baby')
          .select('*')
          .is('deleted_at', null);

        if (error) throw error;

        return data.map((baby) => ({
          id: baby.id,
          name: baby.name,
          birthDate: new Date(baby.birth_date),
          preferredUnits: baby.preferred_units as 'metric' | 'imperial',
          createdAt: new Date(baby.created_at),
          updatedAt: new Date(baby.updated_at),
        }));
      } catch (error) {
        console.warn('Failed to fetch babies from Supabase, falling back to local:', error);
      }
    }

    // Fallback to local storage
    const babies = await db.babies.toArray();
    return babies.map(dbBabyToBaby);
  }

  async createBaby(baby: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>): Promise<Baby> {
    const newBaby: Baby = {
      ...baby,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.getConnectionStatus()) {
      try {
        const { data, error } = await supabase
          .from('baby')
          .insert({
            id: newBaby.id,
            name: baby.name,
            birth_date: baby.birthDate.toISOString().split('T')[0],
            preferred_units: baby.preferredUnits,
          })
          .select()
          .single();

        if (error) throw error;

        // Also create caregiver relationship
        await supabase
          .from('caregiver_relationship')
          .insert({
            caregiver_id: this.user!.id,
            baby_id: newBaby.id,
          });

        return {
          id: data.id,
          name: data.name,
          birthDate: new Date(data.birth_date),
          preferredUnits: data.preferred_units as 'metric' | 'imperial',
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      } catch (error) {
        console.warn('Failed to create baby in Supabase, saving locally:', error);
      }
    }

    // Fallback to local storage
    await db.babies.add(babyToDBBaby(newBaby));
    return newBaby;
  }

  async updateBaby(id: string, updates: Partial<Baby>): Promise<Baby> {
    if (this.getConnectionStatus()) {
      try {
        const { data, error } = await supabase
          .from('baby')
          .update({
            ...(updates.name && { name: updates.name }),
            ...(updates.birthDate && { birth_date: updates.birthDate.toISOString().split('T')[0] }),
            ...(updates.preferredUnits && { preferred_units: updates.preferredUnits }),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          name: data.name,
          birthDate: new Date(data.birth_date),
          preferredUnits: data.preferred_units as 'metric' | 'imperial',
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      } catch (error) {
        console.warn('Failed to update baby in Supabase, updating locally:', error);
      }
    }

    // Fallback to local storage
    await db.babies.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const updated = await db.babies.get(id);
    if (!updated) throw new Error('Baby not found');
    return dbBabyToBaby(updated);
  }

  async deleteBaby(id: string): Promise<void> {
    if (this.getConnectionStatus()) {
      try {
        const { error } = await supabase
          .from('baby')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
        return;
      } catch (error) {
        console.warn('Failed to delete baby in Supabase, deleting locally:', error);
      }
    }

    // Fallback to local storage
    await db.babies.delete(id);
  }

  async getEntries(babyId: string, limit = 100): Promise<Entry[]> {
    if (this.getConnectionStatus()) {
      try {
        const { data, error } = await supabase
          .from('entry')
          .select('*')
          .eq('baby_id', babyId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return data.map((entry) => ({
          id: entry.id,
          babyId: entry.baby_id,
          type: entry.type as 'feed' | 'diaper' | 'sleep',
          timestamp: new Date(entry.created_at),
          createdAt: new Date(entry.created_at),
          createdBy: entry.created_by || undefined,
          payload: entry.payload_json,
        } as Entry));
      } catch (error) {
        console.warn('Failed to fetch entries from Supabase, falling back to local:', error);
      }
    }

    // Fallback to local storage
    const entries = await db.entries
      .where('babyId')
      .equals(babyId)
      .reverse()
      .limit(limit)
      .toArray();
    
    return entries.map(dbEntryToEntry);
  }

  async createEntry(entry: CreateEntry): Promise<Entry> {
    const newEntry: Entry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      createdBy: this.user?.id,
    };

    if (this.getConnectionStatus()) {
      try {
        const { data, error } = await supabase
          .from('entry')
          .insert({
            id: newEntry.id,
            baby_id: entry.babyId,
            type: entry.type,
            payload_json: entry.payload,
            created_by: this.user!.id,
          })
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          babyId: data.baby_id,
          type: data.type as 'feed' | 'diaper' | 'sleep',
          timestamp: new Date(data.created_at),
          createdAt: new Date(data.created_at),
          createdBy: data.created_by || undefined,
          payload: data.payload_json,
        } as Entry;
      } catch (error) {
        console.warn('Failed to create entry in Supabase, saving locally:', error);
      }
    }

    // Fallback to local storage
    await db.entries.add(entryToDBEntry(newEntry));
    return newEntry;
  }

  async updateEntry(id: string, updates: Partial<Entry>): Promise<Entry> {
    if (this.getConnectionStatus()) {
      try {
        const { data, error } = await supabase
          .from('entry')
          .update({
            ...(updates.type && { type: updates.type }),
            ...(updates.payload && { payload_json: updates.payload }),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          babyId: data.baby_id,
          type: data.type as 'feed' | 'diaper' | 'sleep',
          timestamp: new Date(data.created_at),
          createdAt: new Date(data.created_at),
          createdBy: data.created_by || undefined,
          payload: data.payload_json,
        } as Entry;
      } catch (error) {
        console.warn('Failed to update entry in Supabase, updating locally:', error);
      }
    }

    // Fallback to local storage
    await db.entries.update(id, updates);
    const updated = await db.entries.get(id);
    if (!updated) throw new Error('Entry not found');
    return dbEntryToEntry(updated);
  }

  async deleteEntry(id: string): Promise<void> {
    if (this.getConnectionStatus()) {
      try {
        const { error } = await supabase
          .from('entry')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
        return;
      } catch (error) {
        console.warn('Failed to delete entry in Supabase, deleting locally:', error);
      }
    }

    // Fallback to local storage
    await db.entries.delete(id);
  }

  async syncData(): Promise<void> {
    if (!this.getConnectionStatus()) return;

    try {
      // Sync babies
      await this.syncBabies();
      
      // Sync entries for each baby
      const babies = await this.getBabies();
      for (const baby of babies) {
        await this.syncEntries(baby.id);
      }
    } catch (error) {
      console.error('Data sync failed:', error);
    }
  }

  private async syncBabies(): Promise<void> {
    // Get local babies that might not be synced
    const localBabies = await db.babies.toArray();
    
    for (const localBaby of localBabies) {
      try {
        const { error } = await supabase
          .from('baby')
          .upsert({
            id: localBaby.id,
            name: localBaby.name,
            birth_date: localBaby.birthDate,
            preferred_units: localBaby.preferredUnits,
            created_at: localBaby.createdAt,
            updated_at: localBaby.updatedAt,
          });

        if (!error) {
          // Also ensure caregiver relationship exists
          await supabase
            .from('caregiver_relationship')
            .upsert({
              caregiver_id: this.user!.id,
              baby_id: localBaby.id,
            });
        }
      } catch (error) {
        console.warn('Failed to sync baby:', localBaby.id, error);
      }
    }
  }

  private async syncEntries(babyId: string): Promise<void> {
    // Get local entries that might not be synced
    const localEntries = await db.entries
      .where('babyId')
      .equals(babyId)
      .toArray();
    
    for (const localEntry of localEntries) {
      try {
        await supabase
          .from('entry')
          .upsert({
            id: localEntry.id,
            baby_id: localEntry.babyId,
            type: localEntry.type,
            payload_json: JSON.parse(localEntry.payloadJson),
            created_at: localEntry.createdAt,
            created_by: this.user!.id,
          });
      } catch (error) {
        console.warn('Failed to sync entry:', localEntry.id, error);
      }
    }
  }
}

export const dataService = new HybridDataService();

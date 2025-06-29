import { v4 as uuidv4 } from 'uuid';
import { db, babyToDBBaby, dbBabyToBaby, entryToDBEntry, dbEntryToEntry } from './database';
import type { Baby, Entry, CreateEntry } from '../types';

// Baby operations
export async function getAllBabies(): Promise<Baby[]> {
  const dbBabies = await db.babies.orderBy('createdAt').toArray();
  return dbBabies.map(dbBabyToBaby);
}

export async function getBabyById(id: string): Promise<Baby | null> {
  const dbBaby = await db.babies.get(id);
  return dbBaby ? dbBabyToBaby(dbBaby) : null;
}

export async function createBaby(
  babyData: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Baby> {
  const now = new Date();
  const baby: Baby = {
    ...babyData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const dbBaby = babyToDBBaby(baby);
  await db.babies.add(dbBaby);
  return baby;
}

export async function updateBaby(
  id: string, 
  updates: Partial<Omit<Baby, 'id' | 'createdAt'>>
): Promise<void> {
  const existing = await db.babies.get(id);
  if (!existing) {
    throw new Error(`Baby with id ${id} not found`);
  }

  const updatedBaby = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.babies.update(id, updatedBaby);
}

export async function deleteBaby(id: string): Promise<void> {
  // First delete all entries for this baby
  await db.entries.where('babyId').equals(id).delete();
  
  // Then delete the baby
  await db.babies.delete(id);
}

// Entry operations
export async function getAllEntries(babyId: string): Promise<Entry[]> {
  const dbEntries = await db.entries
    .where('babyId')
    .equals(babyId)
    .toArray();
  
  return dbEntries
    .map(dbEntryToEntry)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export async function getEntriesByDateRange(
  babyId: string, 
  startDate: Date, 
  endDate: Date
): Promise<Entry[]> {
  const dbEntries = await db.entries
    .where('babyId')
    .equals(babyId)
    .and(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    })
    .toArray();
  
  return dbEntries
    .map(dbEntryToEntry)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export async function getEntryById(id: string): Promise<Entry | null> {
  const dbEntry = await db.entries.get(id);
  return dbEntry ? dbEntryToEntry(dbEntry) : null;
}

export async function createEntry(entryData: CreateEntry): Promise<Entry> {
  const now = new Date();
  const entry: Entry = {
    ...entryData,
    id: uuidv4(),
    createdAt: now,
  } as Entry;

  const dbEntry = entryToDBEntry(entry);
  await db.entries.add(dbEntry);
  return entry;
}

export async function updateEntry(
  id: string, 
  updates: Partial<Omit<Entry, 'id' | 'createdAt'>>
): Promise<void> {
  const existing = await db.entries.get(id);
  if (!existing) {
    throw new Error(`Entry with id ${id} not found`);
  }

  const updatedEntry = {
    ...existing,
    ...updates,
  };

  // Handle payload updates specially since it's serialized
  if (updates.payload) {
    updatedEntry.payloadJson = JSON.stringify(updates.payload);
  }

  await db.entries.update(id, updatedEntry);
}

export async function deleteEntry(id: string): Promise<void> {
  await db.entries.delete(id);
}

// Utility functions
export async function getLatestEntry(babyId: string): Promise<Entry | null> {
  const dbEntries = await db.entries
    .where('babyId')
    .equals(babyId)
    .toArray();
  
  if (dbEntries.length === 0) return null;
  
  const entries = dbEntries.map(dbEntryToEntry);
  entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return entries[0];
}

export async function getActiveSleepEntry(babyId: string): Promise<Entry | null> {
  const dbEntries = await db.entries
    .where('babyId')
    .equals(babyId)
    .and(entry => entry.type === 'sleep')
    .toArray();
  
  const sleepEntries = dbEntries
    .map(dbEntryToEntry)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Find the most recent sleep entry without an end time
  for (const entry of sleepEntries) {
    if (entry.type === 'sleep' && !entry.payload.endTime) {
      return entry;
    }
  }
  
  return null;
} 
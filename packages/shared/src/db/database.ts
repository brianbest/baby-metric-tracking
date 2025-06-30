import Dexie, { Table } from 'dexie';
import { Baby, Entry } from '../types';

export interface DBBaby extends Omit<Baby, 'birthDate' | 'createdAt' | 'updatedAt'> {
  birthDate: string; // ISO string for IndexedDB
  createdAt: string;
  updatedAt: string;
}

export interface DBEntry extends Omit<Entry, 'timestamp' | 'createdAt'> {
  timestamp: string; // ISO string for IndexedDB
  createdAt: string;
  payloadJson: string; // Serialized payload for IndexedDB
}

export class BabyMetricsDB extends Dexie {
  babies!: Table<DBBaby>;
  entries!: Table<DBEntry>;

  constructor() {
    super('BabyMetricsDB');
    this.version(1).stores({
      babies: 'id, name, birthDate, createdAt',
      entries: 'id, babyId, type, timestamp, createdAt',
    });
  }
}

export const db = new BabyMetricsDB();

// Helper functions to convert between domain models and DB models
export function babyToDBBaby(baby: Baby): DBBaby {
  return {
    ...baby,
    birthDate: baby.birthDate.toISOString(),
    createdAt: baby.createdAt.toISOString(),
    updatedAt: baby.updatedAt.toISOString(),
  };
}

export function dbBabyToBaby(dbBaby: DBBaby): Baby {
  return {
    ...dbBaby,
    birthDate: new Date(dbBaby.birthDate),
    createdAt: new Date(dbBaby.createdAt),
    updatedAt: new Date(dbBaby.updatedAt),
  };
}

export function entryToDBEntry(entry: Entry): DBEntry {
  return {
    ...entry,
    timestamp: entry.timestamp.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    payloadJson: JSON.stringify(entry.payload),
  } as DBEntry;
}

export function dbEntryToEntry(dbEntry: DBEntry): Entry {
  const base = {
    ...dbEntry,
    timestamp: new Date(dbEntry.timestamp),
    createdAt: new Date(dbEntry.createdAt),
    payload: JSON.parse(dbEntry.payloadJson),
  };

  // Type assertion based on entry type
  return base as Entry;
}

import Dexie, { Table } from 'dexie';
import { Baby, Entry } from '../types';
export interface DBBaby extends Omit<Baby, 'birthDate' | 'createdAt' | 'updatedAt'> {
    birthDate: string;
    createdAt: string;
    updatedAt: string;
}
export interface DBEntry extends Omit<Entry, 'timestamp' | 'createdAt'> {
    timestamp: string;
    createdAt: string;
    payloadJson: string;
}
export declare class BabyMetricsDB extends Dexie {
    babies: Table<DBBaby>;
    entries: Table<DBEntry>;
    constructor();
}
export declare const db: BabyMetricsDB;
export declare function babyToDBBaby(baby: Baby): DBBaby;
export declare function dbBabyToBaby(dbBaby: DBBaby): Baby;
export declare function entryToDBEntry(entry: Entry): DBEntry;
export declare function dbEntryToEntry(dbEntry: DBEntry): Entry;

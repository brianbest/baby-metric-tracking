import Dexie from 'dexie';
export class BabyMetricsDB extends Dexie {
    babies;
    entries;
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
export function babyToDBBaby(baby) {
    return {
        ...baby,
        birthDate: baby.birthDate.toISOString(),
        createdAt: baby.createdAt.toISOString(),
        updatedAt: baby.updatedAt.toISOString(),
    };
}
export function dbBabyToBaby(dbBaby) {
    return {
        ...dbBaby,
        birthDate: new Date(dbBaby.birthDate),
        createdAt: new Date(dbBaby.createdAt),
        updatedAt: new Date(dbBaby.updatedAt),
    };
}
export function entryToDBEntry(entry) {
    return {
        ...entry,
        timestamp: entry.timestamp.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        payloadJson: JSON.stringify(entry.payload),
    };
}
export function dbEntryToEntry(dbEntry) {
    const base = {
        ...dbEntry,
        timestamp: new Date(dbEntry.timestamp),
        createdAt: new Date(dbEntry.createdAt),
        payload: JSON.parse(dbEntry.payloadJson),
    };
    // Type assertion based on entry type
    return base;
}

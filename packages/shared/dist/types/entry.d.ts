export type EntryType = 'feed' | 'diaper' | 'sleep';
export interface BaseEntry {
    id: string;
    babyId: string;
    type: EntryType;
    timestamp: Date;
    createdAt: Date;
    createdBy?: string;
    notes?: string;
}
export type FeedSource = 'breast' | 'bottle' | 'solid';
export type BreastSide = 'left' | 'right' | 'both';
export type FormulaType = 'formula' | 'breast_milk' | 'mixed';
export interface FeedEntry extends BaseEntry {
    type: 'feed';
    payload: {
        source: FeedSource;
        volume?: number;
        unit: 'ml' | 'oz';
        duration?: number;
        side?: BreastSide;
        formulaType?: FormulaType;
        bottleType?: string;
        location?: string;
    };
}
export type DiaperType = 'wet' | 'dirty' | 'mixed' | 'dry';
export type DiaperColor = 'yellow' | 'brown' | 'green' | 'red' | 'black' | 'other';
export interface DiaperEntry extends BaseEntry {
    type: 'diaper';
    payload: {
        diaperType: DiaperType;
        color?: DiaperColor;
        consistency?: 'liquid' | 'soft' | 'formed' | 'hard';
        size?: string;
    };
}
export type SleepQuality = 1 | 2 | 3 | 4 | 5;
export interface SleepEntry extends BaseEntry {
    type: 'sleep';
    payload: {
        startTime: Date;
        endTime?: Date;
        duration?: number;
        quality?: SleepQuality;
        location?: string;
        isNap: boolean;
    };
}
export type Entry = FeedEntry | DiaperEntry | SleepEntry;
export type CreateFeedEntry = Omit<FeedEntry, 'id' | 'createdAt'>;
export type CreateDiaperEntry = Omit<DiaperEntry, 'id' | 'createdAt'>;
export type CreateSleepEntry = Omit<SleepEntry, 'id' | 'createdAt'>;
export type CreateEntry = CreateFeedEntry | CreateDiaperEntry | CreateSleepEntry;

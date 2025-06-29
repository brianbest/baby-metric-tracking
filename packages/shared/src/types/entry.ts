export type EntryType = 'feed' | 'diaper' | 'sleep';

export interface BaseEntry {
  id: string;
  babyId: string;
  type: EntryType;
  timestamp: Date;
  createdAt: Date;
  createdBy?: string; // For multi-caregiver support
  notes?: string;
}

// Feed Entry Types
export type FeedSource = 'breast' | 'bottle' | 'solid';
export type BreastSide = 'left' | 'right' | 'both';
export type FormulaType = 'formula' | 'breast_milk' | 'mixed';

export interface FeedEntry extends BaseEntry {
  type: 'feed';
  payload: {
    source: FeedSource;
    volume?: number; // in ml, optional for breastfeeding
    unit: 'ml' | 'oz';
    duration?: number; // in minutes for breastfeeding
    side?: BreastSide; // for breastfeeding
    formulaType?: FormulaType; // for bottle feeding
    bottleType?: string;
    location?: string;
  };
}

// Diaper Entry Types
export type DiaperType = 'wet' | 'dirty' | 'mixed' | 'dry';
export type DiaperColor = 'yellow' | 'brown' | 'green' | 'red' | 'black' | 'other';

export interface DiaperEntry extends BaseEntry {
  type: 'diaper';
  payload: {
    diaperType: DiaperType;
    color?: DiaperColor; // for dirty diapers
    consistency?: 'liquid' | 'soft' | 'formed' | 'hard';
    size?: string; // diaper size
  };
}

// Sleep Entry Types
export type SleepQuality = 1 | 2 | 3 | 4 | 5; // 1 = poor, 5 = excellent

export interface SleepEntry extends BaseEntry {
  type: 'sleep';
  payload: {
    startTime: Date;
    endTime?: Date; // undefined if sleep is in progress
    duration?: number; // in minutes, calculated if endTime exists
    quality?: SleepQuality;
    location?: string; // crib, bed, stroller, etc.
    isNap: boolean; // true for naps, false for nighttime sleep
  };
}

// Union type for all entries
export type Entry = FeedEntry | DiaperEntry | SleepEntry;

// Entry creation types (without generated fields)
export type CreateFeedEntry = Omit<FeedEntry, 'id' | 'createdAt'>;
export type CreateDiaperEntry = Omit<DiaperEntry, 'id' | 'createdAt'>;
export type CreateSleepEntry = Omit<SleepEntry, 'id' | 'createdAt'>;
export type CreateEntry = CreateFeedEntry | CreateDiaperEntry | CreateSleepEntry;

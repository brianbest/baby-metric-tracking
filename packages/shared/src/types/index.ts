// Core entities
export * from './baby';
export * from './entry';

import type { Entry } from './entry';

// UI and utility types
export interface AppSettings {
  language: 'en-US' | 'zh-CN';
  theme: 'dark' | 'light';
  units: 'metric' | 'imperial';
  activeBabyId?: string;
}

export interface QuickActionPreset {
  id: string;
  label: string;
  type: 'feed' | 'diaper' | 'sleep';
  preset: any; // The default values for this quick action
}

export interface TimelineData {
  timestamp: Date;
  entries: Entry[];
}

export interface DashboardStats {
  totalFeeds: number;
  totalSleep: number; // in minutes
  lastFeed?: Date;
  lastSleep?: Date;
  lastDiaper?: Date;
}

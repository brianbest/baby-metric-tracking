export * from './baby';
export * from './entry';
import type { Entry } from './entry';
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
    preset: any;
}
export interface TimelineData {
    timestamp: Date;
    entries: Entry[];
}
export interface DashboardStats {
    totalFeeds: number;
    totalSleep: number;
    lastFeed?: Date;
    lastSleep?: Date;
    lastDiaper?: Date;
}

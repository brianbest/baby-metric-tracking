import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { createBaby, getAllBabies, createEntry, getAllEntries } from './operations';
import { db } from './database';

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Database Operations', () => {
  beforeEach(async () => {
    // Clear all data before each test
    await db.babies.clear();
    await db.entries.clear();
  });

  describe('Baby operations', () => {
    it('should create a baby', async () => {
      const babyData = {
        name: 'Test Baby',
        birthDate: new Date('2024-01-01'),
        preferredUnits: 'metric' as const,
      };

      const baby = await createBaby(babyData);

      expect(baby).toMatchObject({
        name: 'Test Baby',
        birthDate: babyData.birthDate,
        preferredUnits: 'metric',
      });
      expect(baby.id).toBeDefined();
      expect(baby.createdAt).toBeInstanceOf(Date);
    });

    it('should get all babies', async () => {
      const babyData = {
        name: 'Test Baby',
        birthDate: new Date('2024-01-01'),
        preferredUnits: 'metric' as const,
      };

      await createBaby(babyData);
      const babies = await getAllBabies();

      expect(babies).toHaveLength(1);
      expect(babies[0].name).toBe('Test Baby');
    });
  });

  describe('Entry operations', () => {
    it('should create a feed entry', async () => {
      const babyData = {
        name: 'Test Baby',
        birthDate: new Date('2024-01-01'),
        preferredUnits: 'metric' as const,
      };

      const baby = await createBaby(babyData);

      const entryData = {
        babyId: baby.id,
        type: 'feed' as const,
        timestamp: new Date(),
        payload: {
          source: 'breast' as const,
          duration: 15,
          unit: 'ml' as const,
        },
      };

      const entry = await createEntry(entryData);

      expect(entry).toMatchObject({
        babyId: baby.id,
        type: 'feed',
        payload: {
          source: 'breast',
          duration: 15,
          unit: 'ml',
        },
      });
      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeInstanceOf(Date);
    });

    it('should get entries for a baby', async () => {
      const babyData = {
        name: 'Test Baby',
        birthDate: new Date('2024-01-01'),
        preferredUnits: 'metric' as const,
      };

      const baby = await createBaby(babyData);

      const entryData = {
        babyId: baby.id,
        type: 'diaper' as const,
        timestamp: new Date(),
        payload: {
          diaperType: 'wet' as const,
        },
      };

      await createEntry(entryData);
      const entries = await getAllEntries(baby.id);

      expect(entries).toHaveLength(1);
      expect(entries[0].type).toBe('diaper');
    });
  });
});

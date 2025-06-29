import type { Meta, StoryObj } from '@storybook/react';
import { TimelineChart } from './TimelineChart';
import { Entry } from '@baby-tracker/shared';

const meta: Meta<typeof TimelineChart> = {
  title: 'Components/Charts/TimelineChart',
  component: TimelineChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '24-hour timeline chart showing baby activities (feeds, diapers, sleep) throughout the day.',
      },
    },
  },
  argTypes: {
    date: {
      control: { type: 'date' },
      description: 'The date to display entries for',
    },
    height: {
      control: { type: 'number', min: 200, max: 600, step: 50 },
      description: 'Height of the chart in pixels',
    },
    entries: {
      description: 'Array of baby entries to display on the timeline',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockEntries: Entry[] = [
  {
    id: '1',
    babyId: 'baby-1',
    type: 'feed',
    timestamp: new Date('2024-01-15T06:30:00'),
    payload: {
      source: 'breast',
      duration: 15,
      side: 'left',
      unit: 'ml',
    },
    notes: 'Morning feed',
  },
  {
    id: '2',
    babyId: 'baby-1',
    type: 'diaper',
    timestamp: new Date('2024-01-15T07:15:00'),
    payload: {
      diaperType: 'wet',
    },
  },
  {
    id: '3',
    babyId: 'baby-1',
    type: 'sleep',
    timestamp: new Date('2024-01-15T08:00:00'),
    payload: {
      startTime: new Date('2024-01-15T08:00:00'),
      endTime: new Date('2024-01-15T09:30:00'),
      duration: 90,
      quality: 4,
      isNap: true,
    },
  },
  {
    id: '4',
    babyId: 'baby-1',
    type: 'feed',
    timestamp: new Date('2024-01-15T10:00:00'),
    payload: {
      source: 'bottle',
      volume: 120,
      unit: 'ml',
      formulaType: 'formula',
    },
  },
  {
    id: '5',
    babyId: 'baby-1',
    type: 'diaper',
    timestamp: new Date('2024-01-15T11:30:00'),
    payload: {
      diaperType: 'dirty',
      color: 'yellow',
      consistency: 'soft',
    },
  },
  {
    id: '6',
    babyId: 'baby-1',
    type: 'sleep',
    timestamp: new Date('2024-01-15T13:00:00'),
    payload: {
      startTime: new Date('2024-01-15T13:00:00'),
      endTime: new Date('2024-01-15T15:30:00'),
      duration: 150,
      quality: 5,
      isNap: true,
    },
  },
  {
    id: '7',
    babyId: 'baby-1',
    type: 'feed',
    timestamp: new Date('2024-01-15T16:00:00'),
    payload: {
      source: 'breast',
      duration: 20,
      side: 'both',
      unit: 'ml',
    },
  },
];

export const Default: Story = {
  args: {
    entries: mockEntries,
    date: new Date('2024-01-15'),
    height: 300,
  },
};

export const Empty: Story = {
  args: {
    entries: [],
    date: new Date('2024-01-15'),
    height: 300,
  },
};

export const SingleEntry: Story = {
  args: {
    entries: [mockEntries[0]],
    date: new Date('2024-01-15'),
    height: 300,
  },
};

export const TallChart: Story = {
  args: {
    entries: mockEntries,
    date: new Date('2024-01-15'),
    height: 500,
  },
};

export const OnlyFeeds: Story = {
  args: {
    entries: mockEntries.filter(entry => entry.type === 'feed'),
    date: new Date('2024-01-15'),
    height: 300,
  },
};

export const OnlySleep: Story = {
  args: {
    entries: mockEntries.filter(entry => entry.type === 'sleep'),
    date: new Date('2024-01-15'),
    height: 300,
  },
};

export const OnlyDiapers: Story = {
  args: {
    entries: mockEntries.filter(entry => entry.type === 'diaper'),
    date: new Date('2024-01-15'),
    height: 300,
  },
};

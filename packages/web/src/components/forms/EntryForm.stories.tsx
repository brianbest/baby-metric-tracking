import type { Meta, StoryObj } from '@storybook/react';
import { FeedForm } from './FeedForm';
import { DiaperForm } from './DiaperForm';
import { SleepForm } from './SleepForm';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof FeedForm> = {
  title: 'Components/Forms/EntryForms',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Entry forms for tracking baby activities (feeds, diapers, sleep).',
      },
    },
  },
  argTypes: {
    onSubmit: { action: 'submitted' },
    onCancel: { action: 'cancelled' },
  },
};

export default meta;

export const FeedFormDefault: StoryObj<typeof FeedForm> = {
  render: (args) => (
    <FeedForm onSubmit={action('feed-submitted')} onCancel={action('feed-cancelled')} {...args} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Feed entry form for recording breast feeding, bottle feeding, and solid food.',
      },
    },
  },
};

export const FeedFormWithInitialData: StoryObj<typeof FeedForm> = {
  render: (args) => (
    <FeedForm
      onSubmit={action('feed-submitted')}
      onCancel={action('feed-cancelled')}
      initialData={{
        babyId: 'baby-1',
        type: 'feed',
        timestamp: new Date(),
        payload: {
          source: 'bottle',
          volume: 120,
          unit: 'ml',
          formulaType: 'formula',
        },
      }}
      {...args}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Feed form pre-filled with bottle feeding data.',
      },
    },
  },
};

export const DiaperFormDefault: StoryObj<typeof DiaperForm> = {
  render: (args) => (
    <DiaperForm
      onSubmit={action('diaper-submitted')}
      onCancel={action('diaper-cancelled')}
      {...args}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Diaper change entry form for recording wet, dirty, or mixed diapers.',
      },
    },
  },
};

export const SleepFormDefault: StoryObj<typeof SleepForm> = {
  render: (args) => (
    <SleepForm
      onSubmit={action('sleep-submitted')}
      onCancel={action('sleep-cancelled')}
      {...args}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sleep entry form for recording naps and nighttime sleep.',
      },
    },
  },
};

export const SleepFormInProgress: StoryObj<typeof SleepForm> = {
  render: (args) => (
    <SleepForm
      onSubmit={action('sleep-submitted')}
      onCancel={action('sleep-cancelled')}
      initialData={{
        babyId: 'baby-1',
        type: 'sleep',
        timestamp: new Date(),
        payload: {
          startTime: new Date(),
          quality: 4,
          isNap: true,
        },
      }}
      {...args}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sleep form for an ongoing nap (no end time set).',
      },
    },
  },
};

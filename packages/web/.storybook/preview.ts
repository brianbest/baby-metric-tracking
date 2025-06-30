import type { Preview } from '@storybook/react';
import '../src/i18n';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'landmark-one-main',
            enabled: false, // Disabled for component stories
          },
        ],
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#16213e',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['dark', 'light'],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en-US',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en-US', title: 'English' },
          { value: 'zh-CN', title: '中文' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { theme, locale } = context.globals;

      // Apply theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }

      // Apply locale (i18next will be initialized in the component stories)
      if (typeof window !== 'undefined' && window.i18next) {
        window.i18next.changeLanguage(locale);
      }

      return Story();
    },
  ],
};

export default preview;

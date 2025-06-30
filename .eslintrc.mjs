export default {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'airbnb-base'],
  ignorePatterns: ['dist', '.eslintrc.mjs', 'supabase/functions/**/*.ts'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'max-len': ['error', { code: 100, ignoreUrls: true }],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['packages/*/tsconfig.json'],
      },
    },
  },
};

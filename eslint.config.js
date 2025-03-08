import baseConfig from '@bibim/eslint-config/base';

const config = [
  ...baseConfig,
  {
    ignores: [
      'node_modules/*',
      'apps/*',
      'packages/*',
      '.yarn/*',
      '.turbo/*',
      '.idea/*',
    ],
  },
];

export default config;

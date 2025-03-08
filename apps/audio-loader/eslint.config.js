import baseConfig from '@bibim/eslint-config/base';

const config = [
  ...baseConfig,
  {
    ignores: ['node_modules/*', 'dist/*'],
  },
];

export default config;

import baseConfig from './src/base.js';

const config = [
  ...baseConfig,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
];

export default config;

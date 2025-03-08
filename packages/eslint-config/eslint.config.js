import baseConfig from './dist/esm/base.js';

const config = [
  ...baseConfig,
  {
    ignores: ['dist/*', 'node_modules/*'],
  },
];

export default config;

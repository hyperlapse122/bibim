import { Linter } from 'eslint';
import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const config: Linter.Config[] = [
  eslintJs.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'no-empty-pattern': 'off',
    },
  },
];

export default config;

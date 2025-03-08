import type { Config } from 'prettier';
import sqlPlugin from 'prettier-plugin-sql';
import tomlPlugin from 'prettier-plugin-toml';

const config: Config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  endOfLine: 'lf',
  arrowParens: 'always',
  bracketSpacing: true,
  bracketSameLine: false,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  useTabs: false,
  plugins: [sqlPlugin, tomlPlugin],
};

export default config;

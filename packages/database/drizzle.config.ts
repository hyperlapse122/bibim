import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({
  path: ['.env.local', '.env'],
});

export default defineConfig({
  out: './drizzle',
  schema: './src/schemas/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

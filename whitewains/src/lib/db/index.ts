import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Lazy singleton — avoids crashing at import time when DATABASE_URL is a placeholder
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url || url.startsWith('your_')) {
      throw new Error('DATABASE_URL is not configured. Set it in .env.local.');
    }
    // prepare:false required for Supabase transaction/session pooling
    const client = postgres(url, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

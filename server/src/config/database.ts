import knex, { Knex } from 'knex';
import fs from 'fs';
import path from 'path';
import { ENV } from './env';

let dbConfig: Knex.Config;

if (ENV.DATABASE_CLIENT === 'pg') {
  const needsSsl =
    Boolean(ENV.DATABASE_URL) &&
    (ENV.DATABASE_URL.includes('sslmode=') ||
      ENV.DATABASE_URL.includes('.render.com') ||
      ENV.DATABASE_URL.includes('neon.tech') ||
      ENV.DATABASE_URL.includes('supabase.co') ||
      ENV.NODE_ENV === 'production');

  dbConfig = {
    client: 'pg',
    connection: ENV.DATABASE_URL
      ? {
          connectionString: ENV.DATABASE_URL,
          ssl: needsSsl ? { rejectUnauthorized: false } : false,
        }
      : {
          host: process.env.PGHOST || '127.0.0.1',
          port: parseInt(process.env.PGPORT || '5432', 10),
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || 'postgres',
          database: process.env.PGDATABASE || 'college_connect',
        },
    pool: { min: 2, max: 10 },
  };
} else {
  const dir = path.dirname(ENV.SQLITE_FILENAME);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbConfig = {
    client: 'sqlite3',
    connection: {
      filename: ENV.SQLITE_FILENAME,
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, cb: any) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      },
    },
  };
}

export const db = knex(dbConfig);
export default db;

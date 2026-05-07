import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
dotenv.config()
declare global {
    var _postgresConn: postgres.Sql | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.');
}

const conn = globalThis._postgresConn ?? postgres(connectionString);

if (process.env.NODE_ENV !== 'production') {
    globalThis._postgresConn = conn;
}

export const db = drizzle(conn);

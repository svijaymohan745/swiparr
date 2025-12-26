import 'dotenv/config';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client'; // Importing from custom output

const connectionString = process.env.DATABASE_URL?.replace("file:", "") || "swiparr.db";

// Singleton pattern for Next.js to avoid "Too many connections" in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

function createPrismaClient() {
  const sqlite = new Database(connectionString);
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? '',
  });
  
  // Note: Depending on exact adapter version, constructor might vary slightly. 
  // If the line above fails, use: const adapter = new PrismaBetterSqlite3(sqlite);
  
  return new PrismaClient({ adapter });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
import { createDb, type Db } from "@repo/db";

const globalForDb = globalThis as unknown as { db?: Db };

export function getDb(): Db {
  return (globalForDb.db ??= createDb());
}

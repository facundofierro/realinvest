import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { schema } from "./schema";

export type Db = ReturnType<typeof createDb>;

export function createDb(databaseUrl?: string) {
  const url = databaseUrl ?? process.env.DATABASE_URL ?? "file:./wallet.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });
  return drizzle(client, { schema });
}

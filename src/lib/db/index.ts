import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let database: Database | undefined;

export function getDb(): Database {
  if (!database) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    database = drizzle(neon(url), { schema });
  }
  return database;
}

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const realDb = getDb() as object;
    const value = Reflect.get(realDb, prop, receiver);
    return typeof value === "function" ? value.bind(realDb) : value;
  },
});

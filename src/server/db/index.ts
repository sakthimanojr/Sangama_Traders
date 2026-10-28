import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { requiredEnv } from "../env";
import * as schema from "./schema";

function createDb() {
  // DATABASE_URL must be the pooled Neon connection string.
  return drizzle({ client: neon(requiredEnv("DATABASE_URL")), schema });
}

export type Db = ReturnType<typeof createDb>;

let instance: Db | undefined;

export function getDb(): Db {
  instance ??= createDb();
  return instance;
}

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DATABASE_URL =
  "postgresql://postgres:m6rIe9pz2fwQDVBw@db.lfedmwfgftpkknllchxr.supabase.co:5432/postgres";

const connectionString =
  DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/postgres";

console.log(`Using database connection string ${connectionString}`);

console.log("Connecting to database...");

// Configure postgres client with better options for Supabase
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: "require", // Enforce SSL for Supabase connection
});

export const db = drizzle(client, { schema });
export { schema };
export const sqlClient = client;

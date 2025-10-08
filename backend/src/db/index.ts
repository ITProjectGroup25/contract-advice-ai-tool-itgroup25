import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/postgres";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using default connection string");
}

console.log("Connecting to database...");

// Configure postgres client with better options for Supabase
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require', // Enforce SSL for Supabase connection
});

export const db = drizzle(client, { schema });
export { schema };


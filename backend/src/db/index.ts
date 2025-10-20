import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

console.log("📍 Loading database configuration...");

const DATABASE_URL =
  "postgresql://postgres.lfedmwfgftpkknllchxr:m6rIe9pz2fwQDVBw@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/postgres";

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log(`Connecting to database...`);
console.log(`Database host: ${new URL(connectionString).hostname}`);

// Configure postgres client for serverless (Vercel)
const client = postgres(connectionString, {
  max: 1, // Important: Use 1 connection for serverless
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: "require",
  // Add these for better serverless performance
  prepare: false, // Disable prepared statements for pgbouncer
  onnotice: () => {}, // Silence notices
});

export const db = drizzle(client, { schema });
export { schema };
export const sqlClient = client;


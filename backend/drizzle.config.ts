import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import type { Config } from "drizzle-kit";

loadEnv({ path: resolve(__dirname, "../.env"), override: true });
loadEnv({ path: resolve(__dirname, ".env"), override: true });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres",
  },
} satisfies Config;

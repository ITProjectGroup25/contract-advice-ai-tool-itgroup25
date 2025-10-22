import { config as loadEnv } from "dotenv";
import type { Config } from "drizzle-kit";
import { resolve } from "path";

loadEnv({ path: resolve(__dirname, "../.env"), override: true });
loadEnv({ path: resolve(__dirname, ".env"), override: true });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // Add this line
  dbCredentials: {
    // Change connectionString to url
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/postgres",
  },
} satisfies Config;

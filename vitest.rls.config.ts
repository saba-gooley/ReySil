import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Config aparte para los tests de RLS: hablan con el Supabase local
 * (`npx supabase start`) en vez de correr en aislamiento.
 *
 * Se ejecutan en serie y sin paralelismo porque comparten la misma base.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["supabase/tests/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    pool: "forks",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});

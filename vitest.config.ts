import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Los tests de RLS (rls/*.test.ts) hablan con el Supabase local y se
    // corren aparte con `npm run test:rls`, porque necesitan `supabase start`.
    include: ["**/__tests__/**/*.test.ts"],
    exclude: ["node_modules", ".next", "supabase/tests/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

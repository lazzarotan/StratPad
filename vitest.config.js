import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Where to look for test files
    include: ["tests/**/*.test.js"],
  },
  resolve: {
    // Match the @/ alias from tsconfig
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});

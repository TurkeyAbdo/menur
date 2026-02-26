import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    exclude: ["node_modules", "e2e", ".next"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/app/api/**", "src/components/**"],
    },
  },
});

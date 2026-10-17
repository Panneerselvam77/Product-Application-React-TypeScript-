import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  test: {
    environment: "jsdom", // Simulates browser DOM via jsdom
    globals: true, // Allows using describe, it, expect globally without importing them
    setupFiles: "./src/setupTests.js", // Path to your setup file
  },
});

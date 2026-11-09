import { voidPlugin } from "void";
import { voidReact } from "@void/react/plugin";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vite-plus";
import voidConfig from "./void.config.ts";

export default defineConfig({
  plugins: process.env.VITEST ? [] : [voidPlugin(), voidReact()],
  environments: { void_worker: { build: { sourcemap: true } } },
  lint: {
    ignorePatterns: [".cache/**", ".generated/**", ".void/**", "dist/**"],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    ignorePatterns: [
      ".cache/**",
      ".generated/**",
      ".void/**",
      ".void-wrangler.jsonc",
      "dist/**",
      "pnpm-lock.yaml",
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/worker.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [
          cloudflareTest({
            main: "./src/registry-handler.ts",
            config: false,
            miniflare: {
              compatibilityDate: voidConfig.cloudflare?.compatibility_date,
              compatibilityFlags: voidConfig.cloudflare?.compatibility_flags,
            },
          }),
        ],
        test: { name: "worker", include: ["tests/worker.test.ts"] },
      },
    ],
  },
});

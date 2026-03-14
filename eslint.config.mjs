import { dirname } from "path";
import { fileURLToPath } from "url";
import nextConfig from "eslint-config-next";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...(nextConfig.flat?.("next/core-web-vitals", "next/typescript") ?? []),
  {
    settings: {
      next: {
        rootDir: __dirname,
      },
    },
  },
];

export default eslintConfig;

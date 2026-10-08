import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Pin the Turbopack root to this project so a lockfile in a parent directory
     cannot be picked up as the workspace root. */
  output: "export",
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const assetUrl = process.env.NEXT_PUBLIC_ASSET_URL;

if (!assetUrl) {
  throw new Error(
    "NEXT_PUBLIC_ASSET_URL is required. Add it to .env and the deployment environment.",
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("/skecher-components/covers/**", assetUrl)],
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;

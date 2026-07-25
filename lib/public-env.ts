function requiredBaseUrl(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name} is required. Add it to .env and the deployment environment.`);
  }

  return value.replace(/\/+$/, "");
}

export const publicEnv = {
  siteUrl: requiredBaseUrl("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL),
  assetUrl: requiredBaseUrl("NEXT_PUBLIC_ASSET_URL", process.env.NEXT_PUBLIC_ASSET_URL),
} as const;

"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const faviconByTheme = {
  light: "/icon/icon-light.png",
  dark: "/icon/icon-dark.png",
} as const;

export function ThemeFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;

    let favicon = document.head.querySelector<HTMLLinkElement>("#theme-favicon");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.id = "theme-favicon";
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.sizes = "110x110";
      document.head.appendChild(favicon);
    }

    favicon.href = faviconByTheme[resolvedTheme];
  }, [resolvedTheme]);

  return null;
}

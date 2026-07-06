import type { Metadata } from "next";

import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "React Motion Components",
  description:
    "Browse Skecher UI components with live motion previews, dependencies, source files, and shadcn CLI installation commands.",
  path: "/docs",
  keywords: ["React motion components", "shadcn CLI", "component registry"],
});

export default function DocsPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

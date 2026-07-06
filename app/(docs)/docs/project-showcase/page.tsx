import type { Metadata } from "next";

import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Project Showcase",
  description:
    "Explore projects and interface examples built with Skecher UI motion components for React.",
  path: "/docs/project-showcase",
  keywords: ["Skecher UI projects", "React component examples"],
});

const Page = () => {
  return (
    <div className="h-screen rounded-xl border-[0.5px] border-sidebar-border bg-sidebar pt-20 shadow-sm">
      <div className="page flex h-full flex-col items-center justify-center">
        <h1 className="mx-auto p-2 text-center font-raleway text-4xl font-light">
          Project Showcase
        </h1>
      </div>
    </div>
  );
};

export default Page;

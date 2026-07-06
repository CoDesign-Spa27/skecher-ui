import * as path from "path";

import type { Schema } from "./registry-schema";

type ComponentProps = Partial<
  Pick<Schema, "dependencies" | "devDependencies" | "registryDependencies" | "cssVars" | "tailwind">
> & {
  name: string;
  path: string;
};

export const components: ComponentProps[] = [
  {
    name: "dock",
    path: path.join(__dirname, "../components/ui-components/dock"),
    dependencies: ["motion"],
    devDependencies: [],
    registryDependencies: [],
  },
  {
    name: "gooey-toolbar",
    path: path.join(__dirname, "../components/ui-components/gooey-toolbar"),
    dependencies: ["clsx", "motion", "nucleo-ui-essential-fill-duo-18", "tailwind-merge"],
    devDependencies: [],
    registryDependencies: [],
  },
  {
    name: "image-density-grid",
    path: path.join(__dirname, "../components/ui-components/image-density-grid"),
    dependencies: ["motion"],
    devDependencies: [],
    registryDependencies: [],
  },
  {
    name: "image-glide",
    path: path.join(__dirname, "../components/ui-components/image-glide"),
    dependencies: ["motion"],
    devDependencies: [],
    registryDependencies: [],
  },
  {
    name: "liquid-glass-social",
    path: path.join(__dirname, "../components/ui-components/liquid-glass-social"),
    dependencies: ["motion", "nucleo-social-media", "nucleo-ui-essential-fill-18"],
    devDependencies: [],
    registryDependencies: [],
  },
  {
    name: "liquid-morphology-slideshow",
    path: path.join(__dirname, "../components/ui-components/liquid-morphology-slideshow"),
    dependencies: ["three"],
    devDependencies: ["@types/three"],
    registryDependencies: [],
  },
  {
    name: "magazine-scroller",
    path: path.join(__dirname, "../components/ui-components/magazine-scroller"),
    dependencies: ["motion"],
    devDependencies: [],
    registryDependencies: ["progressive-blur"],
  },
  {
    name: "morphing-action-dock",
    path: path.join(__dirname, "../components/ui-components/morphing-action-dock"),
    dependencies: ["lucide-react", "motion"],
    devDependencies: [],
    registryDependencies: [],
  },
  {
    name: "streaming-text",
    path: path.join(__dirname, "../components/ui-components/streaming-text"),
    dependencies: ["motion"],
    devDependencies: [],
    registryDependencies: [],
  },
  {
    name: "text-morphing",
    path: path.join(__dirname, "../components/ui-components/text-morphing"),
    dependencies: ["motion"],
    devDependencies: [],
    registryDependencies: [],
  },
];

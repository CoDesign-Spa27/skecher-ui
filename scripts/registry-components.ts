import * as path from "path";
import type { Schema } from "./registry-schema";

type ComponentProps = Partial<
  Pick<
    Schema,
    | "dependencies"
    | "devDependencies"
    | "registryDependencies"
    | "cssVars"
    | "tailwind"
  >
> & {
  name: string;
  path: string;
};

export const components: ComponentProps[] = [
  {
    name: "gooey-toolbar",
    path: path.join(__dirname, "../components/ui-components/gooey-toolbar"),
    dependencies: ["motion"],
  },
  {
    name: "image-glide",
    path: path.join(__dirname, "../components/ui-components/image-glide"),
    dependencies: ["motion"],
  },
  {
    name: "liquid-glass-social",
    path: path.join(__dirname, "../components/ui-components/liquid-glass-social"),
    dependencies: ["motion"],
  },
  {
    name: "streaming-text",
    path: path.join(__dirname, "../components/ui-components/streaming-text"),
    dependencies: ["motion"],
  },
  {
    name: "text-morphing",
    path: path.join(__dirname, "../components/ui-components/text-morphing"),
    dependencies: ["motion"],
  }
];

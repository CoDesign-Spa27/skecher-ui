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
    name: "streaming-text",
    path: path.join(
      __dirname,
      "../components/ui-components/streaming-text"
    ),
    registryDependencies: ["motion"],
    dependencies: ["motion"],
  },
];
import fs from "fs";
import path from "path";
import type { Schema } from "./registry-schema";
import { components } from "./registry-components";

const registryComponents = path.join(__dirname, "../public/components");
const registryItems = path.join(__dirname, "../public/r");

fs.mkdirSync(registryComponents, { recursive: true });
fs.mkdirSync(registryItems, { recursive: true });

for (const component of components) {
  const content = fs.readFileSync(`${component.path}.tsx`, "utf8");
  const schema = {
    name: component.name,
    type: "registry:ui",
    registryDependencies: component.registryDependencies || [],
    dependencies: component.dependencies || [],
    devDependencies: component.devDependencies || [],
    tailwind: component.tailwind || {},
    cssVars: component.cssVars || {
      light: {},
      dark: {},
    },
    files: [
      {
        path: `${component.name}.tsx`,
        content,
        type: "registry:ui",
      },
    ],
  } satisfies Schema;

  const json = JSON.stringify(schema, null, 2);

  fs.writeFileSync(path.join(registryComponents, `${component.name}.json`), json);
  fs.writeFileSync(path.join(registryItems, `${component.name}.json`), json);
}

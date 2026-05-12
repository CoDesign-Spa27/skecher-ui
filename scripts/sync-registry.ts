// Types are picked from
// https://github.com/pqoqubbw/icons
// Go start it :3

import * as fs from "fs";
import * as path from "path";
import { components } from "./registry-components";

function getChartFiles(dir: string, baseDir: string): string[] {
  let files: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "utils") {
          files = files.concat(getChartFiles(fullPath, baseDir));
        }
      } else if (
        entry.isFile() &&
        entry.name.endsWith(".tsx") &&
        entry.name !== "index.ts"
      ) {
        files.push(path.relative(baseDir, fullPath));
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  return files;
}

function updateRegistryComponents() {
  const chartsDir = path.join(process.cwd(), "charts");
  const existingComponents = new Set(
    components.map((c) => path.relative(chartsDir, c.path) + ".tsx")
  );

  const newComponents: {
    name: string;
    path: string;
    registryDependencies: string[];
    dependencies: string[];
  }[] = [];

  const allChartFiles = getChartFiles(chartsDir, chartsDir);

  for (const file of allChartFiles) {
    // on windows, path.relative returns paths with backslashes
    // we convert them to forward slashes to be consistent
    const normalizedFile = file.replace(/\\/g, "/");
    if (!existingComponents.has(normalizedFile)) {
      const name = path.basename(normalizedFile, ".tsx");
      const componentPath = normalizedFile.replace(/\.tsx$/, "");

      newComponents.push({
        name,
        path: componentPath,
        registryDependencies: ["motion"],
        dependencies: ["motion"],
      });
    }
  }

  if (newComponents.length === 0) {
    console.log("no new components to add.");
    return;
  }

  const registryPath = path.join(__dirname, "registry-components.ts");
  const content = fs.readFileSync(registryPath, "utf8");

  const lastComponentIndex = content.lastIndexOf("}");
  const closingBracketIndex = content.lastIndexOf("];");

  if (closingBracketIndex === -1) {
    console.error(
      "Could not find the closing bracket of the components array in registry-components.ts"
    );
    return;
  }

  const newComponentsString = newComponents
    .map(
      (comp) =>
        `  {\n    name: "${comp.name}",\n    path: path.join(__dirname, "../components/ui-components/${comp.path}"),\n    registryDependencies: ["motion"],\n    dependencies: ["motion"],\n  }`
    )
    .join(",\n");

  const prefix = lastComponentIndex > 0 ? ",\n" : "";

  const updatedContent =
    content.slice(0, closingBracketIndex) +
    prefix +
    newComponentsString +
    "\n];";

  fs.writeFileSync(registryPath, updatedContent);

  console.log(`added ${newComponents.length} new components:`);
  console.log(newComponents.map((c) => c.name).join(", "));
}

updateRegistryComponents();
import fs from "node:fs";
import path from "node:path";

import { loadRegistry, loadRegistryItem } from "shadcn/registry";
import { registryItemSchema, registrySchema } from "shadcn/schema";

const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "registry.json");
const componentSourceDirectory = path.join(root, "components/ui-components");
const ignoredPackages = new Set(["react", "react-dom"]);

function fail(message: string): never {
  throw new Error(`Registry validation failed: ${message}`);
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
}

function getImportSpecifiers(content: string) {
  const specifiers = new Set<string>();
  const patterns = [
    /(?:import|export)\s+[^"';]*?\s+from\s+["']([^"']+)["']/g,
    /import\s+["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      specifiers.add(match[1]);
    }
  }

  return specifiers;
}

function getPackageName(specifier: string) {
  if (specifier.startsWith(".") || specifier.startsWith("@/")) {
    return null;
  }

  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/");
    return name ? `${scope}/${name}` : scope;
  }

  return specifier.split("/")[0];
}

function resolveRelativeImport(sourceFile: string, specifier: string) {
  const basePath = path.resolve(path.dirname(sourceFile), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];

  return candidates.find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  );
}

function getDeclaredPackages(item: { dependencies?: string[] }) {
  return new Set(
    (item.dependencies ?? []).map((dependency) => getPackageName(dependency) ?? dependency),
  );
}

function formatSet(values: Set<string>) {
  return [...values].sort().join(", ") || "none";
}

const sourceRegistry = readJson(registryPath);
const registryResult = registrySchema.safeParse(sourceRegistry);

if (!registryResult.success) {
  fail(registryResult.error.issues.map((issue) => issue.message).join("; "));
}

if (
  sourceRegistry &&
  typeof sourceRegistry === "object" &&
  "include" in sourceRegistry &&
  Array.isArray(sourceRegistry.include) &&
  sourceRegistry.include.length > 0
) {
  fail("the root registry must stay flat and must not use include");
}

const items = registryResult.data.items ?? [];
const itemNames = new Set<string>();
const registeredComponentSources = new Set<string>();

for (const item of items) {
  if (itemNames.has(item.name)) {
    fail(`duplicate item name "${item.name}"`);
  }
  itemNames.add(item.name);

  if (!item.title?.trim() || !item.description?.trim()) {
    fail(`item "${item.name}" must include a useful title and description`);
  }

  if (!item.files?.length) {
    fail(`item "${item.name}" must include at least one source file`);
  }

  const itemFilePaths = new Set((item.files ?? []).map((file) => path.resolve(root, file.path)));
  const detectedPackages = new Set<string>();

  for (const file of item.files ?? []) {
    if (file.content !== undefined) {
      fail(`source item "${item.name}" must not inline content for "${file.path}"`);
    }

    const absolutePath = path.resolve(root, file.path);
    const relativePath = path.relative(root, absolutePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      fail(`item "${item.name}" references a file outside the repository: "${file.path}"`);
    }

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      fail(`item "${item.name}" references missing file "${file.path}"`);
    }

    if (file.path.startsWith("components/ui-components/")) {
      if (registeredComponentSources.has(file.path)) {
        fail(`component source "${file.path}" is registered more than once`);
      }
      registeredComponentSources.add(file.path);
    }

    const content = fs.readFileSync(absolutePath, "utf8");
    const customUtilsImports = Array.from(
      content.matchAll(/import\s*{([^}]*)}\s*from\s*["']@\/lib\/utils["']/g),
    ).flatMap((match) =>
      match[1]
        .split(",")
        .map(
          (name) =>
            name
              .trim()
              .replace(/^type\s+/, "")
              .split(/\s+as\s+/)[0],
        )
        .filter(Boolean),
    );
    const unsupportedUtilsImports = customUtilsImports.filter((name) => name !== "cn");

    if (unsupportedUtilsImports.length > 0) {
      fail(
        `item "${item.name}" imports non-standard helpers from @/lib/utils: ${unsupportedUtilsImports.join(", ")}`,
      );
    }

    for (const specifier of getImportSpecifiers(content)) {
      if (specifier.startsWith(".")) {
        const resolvedImport = resolveRelativeImport(absolutePath, specifier);

        if (resolvedImport && !itemFilePaths.has(resolvedImport)) {
          fail(
            `item "${item.name}" must include relative import "${specifier}" from "${file.path}"`,
          );
        }
        continue;
      }

      const packageName = getPackageName(specifier);
      if (packageName && !ignoredPackages.has(packageName)) {
        detectedPackages.add(packageName);
      }
    }
  }

  const declaredPackages = getDeclaredPackages(item);
  if (formatSet(detectedPackages) !== formatSet(declaredPackages)) {
    fail(
      `item "${item.name}" dependency mismatch; detected ${formatSet(detectedPackages)}, declared ${formatSet(declaredPackages)}`,
    );
  }
}

const componentSources = fs
  .readdirSync(componentSourceDirectory)
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => `components/ui-components/${file}`)
  .sort();
const unregisteredSources = componentSources.filter(
  (file) => !registeredComponentSources.has(file),
);

if (unregisteredSources.length > 0) {
  fail(`unregistered component sources: ${unregisteredSources.join(", ")}`);
}

async function validateResolvedItems() {
  const loadedRegistry = await loadRegistry({ cwd: root, registryFile: "registry.json" });
  registrySchema.parse(loadedRegistry);

  for (const item of items) {
    const loadedItem = await loadRegistryItem(item.name, {
      cwd: root,
      registryFile: "registry.json",
    });
    const parsedItem = registryItemSchema.parse(loadedItem);

    if (!parsedItem.files?.every((file) => typeof file.content === "string")) {
      fail(`resolved item "${item.name}" is missing inlined file content`);
    }
  }

  console.log(
    `Validated ${items.length} registry items and ${registeredComponentSources.size} component sources.`,
  );
}

validateResolvedItems().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

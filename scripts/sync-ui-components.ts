import fs from "node:fs";
import path from "node:path";

const root = path.join(__dirname, "..");
const uiComponentsDir = path.join(root, "components/ui-components");
const docsContentDir = path.join(root, "components/docs/content");
const docsContentPath = path.join(root, "lib/docs-content.ts");
const generatedRenderersPath = path.join(docsContentDir, "generated-doc-renderers.ts");
const githubRegistryRepository = "CoDesign-Spa27/skecher-ui";

type ComponentInfo = {
  slug: string;
  title: string;
  componentPath: string;
  docPath: string;
  docExportName: string | null;
  importName: string;
  dependencies: string[];
  devDependencies: string[];
  installDependencies: string[];
};

// Packages every shadcn/React consumer already has — never emit as a dependency.
const IGNORED_PACKAGES = new Set(["react", "react-dom"]);

// @types/* packages installed at the repo root, used to auto-pair type deps
// (e.g. detecting `three` adds `@types/three` when it's available here).
const availableTypePackages = new Set(
  (() => {
    const pkg = JSON.parse(readText(path.join(root, "package.json")) || "{}");
    return Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((name) =>
      name.startsWith("@types/"),
    );
  })(),
);

// Turn an import specifier into its installable package name, or null for
// internal/relative imports. "motion/react" -> "motion",
// "@radix-ui/react-slot" -> "@radix-ui/react-slot", "@/lib/utils" -> null.
function getPackageName(specifier: string): string | null {
  if (specifier.startsWith("@/") || specifier.startsWith(".")) return null;
  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/");
    return name ? `${scope}/${name}` : scope;
  }
  return specifier.split("/")[0];
}

// The @types package name for a runtime dependency, per the @types convention:
// "three" -> "@types/three", "@scope/pkg" -> "@types/scope__pkg".
function getTypesPackageName(pkg: string): string {
  return pkg.startsWith("@") ? `@types/${pkg.slice(1).replace("/", "__")}` : `@types/${pkg}`;
}

// Collect every module specifier a file imports: static imports/re-exports,
// side-effect imports, and dynamic/type `import("x")` (how `three` is loaded).
function getImportSpecifiers(content: string): string[] {
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
  return [...specifiers];
}

// Derive a component's dependencies directly from its source, so the registry
// output can never drift from what the file actually imports.
function detectDependencies(content: string) {
  const dependencies = new Set<string>();
  const devDependencies = new Set<string>();
  const registryDependencies = new Set<string>();

  for (const specifier of getImportSpecifiers(content)) {
    // Internal shadcn ui primitive (`@/components/ui/x` or `../ui/x`) -> a
    // registry dependency the CLI resolves, not an npm install.
    const uiMatch = specifier.match(/(?:^@\/components\/ui\/|(?:\.\.?\/)+ui\/)([\w-]+)$/);
    if (uiMatch) {
      registryDependencies.add(uiMatch[1]);
      continue;
    }

    const pkg = getPackageName(specifier);
    if (!pkg || IGNORED_PACKAGES.has(pkg)) continue;

    dependencies.add(pkg);
    const typesPkg = getTypesPackageName(pkg);
    if (availableTypePackages.has(typesPkg)) devDependencies.add(typesPkg);
  }

  return {
    dependencies: [...dependencies].sort(),
    devDependencies: [...devDependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
  };
}

function toTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toPascalCase(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function toObjectKey(value: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) ? value : JSON.stringify(value);
}

function readText(filePath: string) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function getExportedDocName(content: string) {
  return content.match(/export\s+async\s+function\s+([A-Za-z0-9_]+)/)?.[1] ?? null;
}

function getExportedComponentName(content: string, slug: string) {
  const exports = Array.from(
    content.matchAll(/export\s+(?:class|const|function)\s+([A-Za-z0-9_]+)/g),
  ).map((match) => match[1]);
  return exports.at(-1) ?? toPascalCase(slug);
}

function createDocStub(component: Pick<ComponentInfo, "slug" | "title">) {
  return `import { CodeBlock } from "@/components/docs/ui/code-block";
import { ComponentDocSections } from "@/components/docs/content/component-doc-sections";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import type { ComponentDoc } from "@/lib/docs-content";
import { promises as fs } from "node:fs";
import path from "node:path";

const FILE_PATH = "components/ui-components/${component.slug}.tsx";

export async function ${toPascalCase(component.slug)}Doc({ page }: { page: ComponentDoc }) {
  const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

  return (
    <ComponentWrapper
      code={<CodeBlock filePath={FILE_PATH} />}
      codeString={codeString}
      doc={<ComponentDocSections page={page} />}
      title="${component.slug}.tsx"
    >
      <div className="text-sm text-muted-foreground">${component.title} preview</div>
    </ComponentWrapper>
  );
}
`;
}

function getComponents() {
  return fs
    .readdirSync(uiComponentsDir)
    .filter((file) => file.endsWith(".tsx"))
    .sort()
    .map((file): ComponentInfo => {
      const slug = path.basename(file, ".tsx");
      const componentPath = path.join(uiComponentsDir, file);
      const docPath = path.join(docsContentDir, `${slug}-doc.tsx`);
      const componentContent = readText(componentPath);
      const title = toTitle(slug);
      const importName = getExportedComponentName(componentContent, slug);

      if (!fs.existsSync(docPath)) {
        fs.writeFileSync(docPath, createDocStub({ slug, title }));
      }

      const docContent = readText(docPath);
      const { dependencies, devDependencies } = detectDependencies(componentContent);

      return {
        slug,
        title,
        componentPath,
        docPath,
        docExportName: getExportedDocName(docContent),
        importName,
        dependencies,
        devDependencies,
        installDependencies: dependencies,
      };
    });
}

function createDocEntry(component: ComponentInfo) {
  return `  {
    id: "${component.slug}",
    title: "${component.title}",
    slug: "${component.slug}",
    eyebrow: "Components",
    description:
      "A polished animated UI primitive for expressive product interfaces.",
    details: [],
    dependencies: ${JSON.stringify(["react", ...component.dependencies])},
    installDependencies: ${JSON.stringify(component.installDependencies)},
    cliCommand: "${githubRegistryRepository}/${component.slug}",
    importName: "${component.importName}",
    usage: \`import { ${component.importName} } from "@/components/ui/${component.slug}";

export default function ${component.importName}Example() {
  return <${component.importName} />;
}\`,
    files: [
      {
        path: "components/ui-components/${component.slug}.tsx",
        description: "${component.title} component",
      },
    ],
  }`;
}

function syncDocsContent(components: ComponentInfo[]) {
  let content = fs.readFileSync(docsContentPath, "utf8");
  const existingSlugs = new Set(
    Array.from(content.matchAll(/slug:\s*"([^"]+)"/g)).map((match) => match[1]),
  );
  const missingEntries = components
    .filter((component) => !existingSlugs.has(component.slug))
    .map(createDocEntry);

  if (!missingEntries.length) {
    return;
  }

  content = content.replace(
    /,?\n\];\n\nexport function getComponentDoc/,
    `,\n${missingEntries.join(",\n")},\n];\n\nexport function getComponentDoc`,
  );
  fs.writeFileSync(docsContentPath, content);
}

function syncDocRenderers(components: ComponentInfo[]) {
  const documentedComponents = components.filter((component) => component.docExportName);
  const imports = documentedComponents
    .map(
      (component) =>
        `import { ${component.docExportName} } from "@/components/docs/content/${component.slug}-doc";`,
    )
    .join("\n");
  const entries = documentedComponents
    .map((component) => `  ${toObjectKey(component.slug)}: ${component.docExportName}`)
    .join(",\n");

  const content = `${imports}
import type { getComponentDoc } from "@/lib/docs-content";

type ComponentDocPage = (props: {
  page: NonNullable<ReturnType<typeof getComponentDoc>>;
}) => Promise<React.ReactNode>;

export const DOC_RENDERERS = {
${entries},
} satisfies Record<string, ComponentDocPage>;
`;

  fs.writeFileSync(generatedRenderersPath, content);
}

const components = getComponents();

syncDocsContent(components);
syncDocRenderers(components);

console.log(`synced ${components.length} UI component${components.length === 1 ? "" : "s"}.`);

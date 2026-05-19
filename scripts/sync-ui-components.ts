import fs from "node:fs";
import path from "node:path";

const root = path.join(__dirname, "..");
const uiComponentsDir = path.join(root, "components/ui-components");
const docsContentDir = path.join(root, "components/docs/content");
const registryComponentsPath = path.join(__dirname, "registry-components.ts");
const docsContentPath = path.join(root, "lib/docs-content.ts");
const generatedRenderersPath = path.join(docsContentDir, "generated-doc-renderers.ts");
const deployedRegistryUrl = "https://skecher-ui.vercel.app/r";

type ComponentInfo = {
  slug: string;
  title: string;
  componentPath: string;
  docPath: string;
  docExportName: string | null;
  importName: string;
};

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

function readText(filePath: string) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function getExportedDocName(content: string) {
  return content.match(/export\s+async\s+function\s+([A-Za-z0-9_]+)/)?.[1] ?? null;
}

function getExportedComponentName(content: string, slug: string) {
  const exports = Array.from(content.matchAll(/export\s+const\s+([A-Za-z0-9_]+)/g)).map(
    (match) => match[1]
  );
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

      return {
        slug,
        title,
        componentPath,
        docPath,
        docExportName: getExportedDocName(docContent),
        importName,
      };
    });
}

function syncRegistryComponents(components: ComponentInfo[]) {
  const entries = components
    .map(
      (component) => `  {
    name: "${component.slug}",
    path: path.join(__dirname, "../components/ui-components/${component.slug}"),
    dependencies: ["motion"],
  }`
    )
    .join(",\n");

  const content = `import * as path from "path";
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
${entries}
];
`;

  fs.writeFileSync(registryComponentsPath, content);
}

function createDocEntry(component: ComponentInfo) {
  return `  {
    title: "${component.title}",
    slug: "${component.slug}",
    eyebrow: "Components",
    description:
      "A polished animated UI primitive for expressive product interfaces.",
    details: [],
    dependencies: ["react", "motion"],
    installDependencies: ["motion"],
    cliCommand: "${deployedRegistryUrl}/${component.slug}.json",
    importName: "${component.importName}",
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
    Array.from(content.matchAll(/slug:\s*"([^"]+)"/g)).map((match) => match[1])
  );
  const missingEntries = components
    .filter((component) => !existingSlugs.has(component.slug))
    .map(createDocEntry);

  if (!missingEntries.length) {
    return;
  }

  content = content.replace(
    /\n\];\n\nexport function getComponentDoc/,
    `,\n${missingEntries.join(",\n")}\n];\n\nexport function getComponentDoc`
  );
  fs.writeFileSync(docsContentPath, content);
}

function syncDocRenderers(components: ComponentInfo[]) {
  const documentedComponents = components.filter((component) => component.docExportName);
  const imports = documentedComponents
    .map(
      (component) =>
        `import { ${component.docExportName} } from "@/components/docs/content/${component.slug}-doc";`
    )
    .join("\n");
  const entries = documentedComponents
    .map((component) => `  "${component.slug}": ${component.docExportName}`)
    .join(",\n");

  const content = `${imports}
import type { getComponentDoc } from "@/lib/docs-content";

type ComponentDocPage = (props: {
  page: NonNullable<ReturnType<typeof getComponentDoc>>;
}) => Promise<React.ReactNode>;

export const DOC_RENDERERS = {
${entries}
} satisfies Record<string, ComponentDocPage>;
`;

  fs.writeFileSync(generatedRenderersPath, content);
}

const components = getComponents();

syncRegistryComponents(components);
syncDocsContent(components);
syncDocRenderers(components);

console.log(`synced ${components.length} UI component${components.length === 1 ? "" : "s"}.`);

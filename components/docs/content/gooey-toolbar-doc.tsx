import { CodeBlock } from "@/components/docs/ui/code-block";
import { ComponentDocSections } from "@/components/docs/content/component-doc-sections";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import type { ComponentDoc } from "@/lib/docs-content";
import { promises as fs } from "node:fs";
import path from "node:path";
import GooeyToolbar from "@/components/ui-components/gooey-toolbar";

const FILE_PATH = "components/ui-components/gooey-toolbar.tsx";

export async function GooeyToolbarDoc({ page }: { page: ComponentDoc }) {
  const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

  return (
    <ComponentWrapper
      code={<CodeBlock filePath={FILE_PATH} />}
      codeString={codeString}
      doc={<ComponentDocSections page={page} />}
      title="gooey-toolbar.tsx"
    >
   <GooeyToolbar />
    </ComponentWrapper>
  );
}

import { promises as fs } from "node:fs";
import path from "node:path";

import { ComponentDocSections } from "@/components/docs/content/component-doc-sections";
import { getComponentPreview } from "@/components/docs/content/component-previews";
import { CodeBlock } from "@/components/docs/ui/code-block";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import type { ComponentDoc } from "@/lib/docs-content";

const FILE_PATH = "components/ui-components/glitch-typewriter.tsx";

export async function GlitchTypewriterDoc({ page }: { page: ComponentDoc }) {
  const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

  return (
    <ComponentWrapper
      code={<CodeBlock filePath={FILE_PATH} />}
      codeString={codeString}
      doc={<ComponentDocSections page={page} />}
      previewHref={`/preview/${page.slug}`}
      title="glitch-typewriter.tsx"
    >
      {getComponentPreview(page.slug)}
    </ComponentWrapper>
  );
}

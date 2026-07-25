import { promises as fs } from "node:fs";
import path from "node:path";

import { ComponentDocSections } from "@/components/docs/content/component-doc-sections";
import { getComponentPreview } from "@/components/docs/content/component-previews";
import { CodeBlock } from "@/components/docs/ui/code-block";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import type { ComponentDoc } from "@/lib/docs-content";

const FILE_PATH = "components/ui-components/dither-credit-card.tsx";

export async function DitherCreditCardDoc({ page }: { page: ComponentDoc }) {
  const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

  return (
    <ComponentWrapper
      breadcrumbTitle={page.title}
      code={<CodeBlock filePath={FILE_PATH} />}
      codeString={codeString}
      doc={<ComponentDocSections page={page} />}
      previewHref={`/preview/${page.slug}`}
      title="dither-credit-card.tsx"
      className="w-full min-w-0 overflow-hidden rounded-2xl mx-auto"
    >
      {getComponentPreview(page.slug)}
    </ComponentWrapper>
  );
}

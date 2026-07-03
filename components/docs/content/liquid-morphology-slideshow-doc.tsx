import { ComponentDocSections } from "@/components/docs/content/component-doc-sections";
import { getComponentPreview } from "@/components/docs/content/component-previews";
import { CodeBlock } from "@/components/docs/ui/code-block";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import type { ComponentDoc } from "@/lib/docs-content";
import { promises as fs } from "node:fs";
import path from "node:path";

const FILE_PATH = "components/ui-components/liquid-morphology-slideshow.tsx";

export async function LiquidMorphologySlideshowDoc({ page }: { page: ComponentDoc }) {
  const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

  return (
    <ComponentWrapper
      code={<CodeBlock filePath={FILE_PATH} />}
      codeString={codeString}
      doc={<ComponentDocSections page={page} />}
      previewClassName="overflow-hidden"
      previewHref={`/preview/${page.slug}`}
      title="liquid-morphology-slideshow.tsx"
    >
      {getComponentPreview(page.slug)}
    </ComponentWrapper>
  );
}

import { CodeBlock } from "@/components/docs/ui/code-block";
import { ComponentDocSections } from "@/components/docs/content/component-doc-sections";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import type { ComponentDoc } from "@/lib/docs-content";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ImageGlide } from "@/components/ui-components/image-glide";

const FILE_PATH = "components/ui-components/image-glide.tsx";

export async function ImageGlideDoc({ page }: { page: ComponentDoc }) {
  const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

  return (
    <ComponentWrapper
      code={<CodeBlock filePath={FILE_PATH} />}
      codeString={codeString}
      doc={<ComponentDocSections page={page} />}
      previewClassName="bg-background"
      title="image-glide.tsx"
    >
      <ImageGlide />
    </ComponentWrapper>
  );
}

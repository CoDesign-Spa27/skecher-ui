import { CodeBlock } from "@/components/docs/ui/code-block";
import { ComponentDocSections } from "@/components/docs/content/component-doc-sections";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import { BlurredText } from "@/components/ui-components/streaming-text";
import type { ComponentDoc } from "@/lib/docs-content";
import { promises as fs } from "node:fs";
import path from "node:path";

const FILE_PATH = "components/ui-components/streaming-text.tsx";

export async function StreamingTextDoc({ page }: { page: ComponentDoc }) {
  const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

  return (
    <ComponentWrapper
      code={<CodeBlock filePath={FILE_PATH} />}
      codeString={codeString}
      doc={<ComponentDocSections page={page} />}
      title="streaming-text.tsx"
    >
      <BlurredText
        text="Stop acting as if life is a rehearsal."
        className="mx-auto p-2 text-center font-raleway text-4xl font-medium"
      />
    </ComponentWrapper>
  );
}

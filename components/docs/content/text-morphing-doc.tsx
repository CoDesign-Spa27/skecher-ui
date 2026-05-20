import { CodeBlock } from "@/components/docs/ui/code-block";
import { ComponentDocSections } from "@/components/docs/content/component-doc-sections";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import { MorphingText } from "@/components/ui-components/text-morphing";
import type { ComponentDoc } from "@/lib/docs-content";
import { promises as fs } from "node:fs";
import path from "node:path";

const FILE_PATH = "components/ui-components/text-morphing.tsx";

export async function TextMorphingDoc({ page }: { page: ComponentDoc }) {
    const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

    return (
        <ComponentWrapper
            code={<CodeBlock filePath={FILE_PATH} />}
            codeString={codeString}
            doc={<ComponentDocSections page={page} />}
            title="text-morphing.tsx"
        >
            <MorphingText
                texts={[
                    "AI begins analyzing your data...",
                    "Processing information and finding patterns...",
                    "Generating intelligent responses...",
                    "Learning and adapting to improve results...",
                    "AI process complete: ready for your next command..."
                ]}
                className="mx-auto p-2 text-center font-raleway font-medium"
            />
        </ComponentWrapper>
    );
}

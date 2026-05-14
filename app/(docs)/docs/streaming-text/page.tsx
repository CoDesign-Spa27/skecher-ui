import { BlurredText } from "@/components/ui-components/streaming-text";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import { CodeBlock } from "@/components/docs/ui/code-block";
import { promises as fs } from "node:fs";
import path from "node:path";

const FILE_PATH = "components/ui-components/streaming-text.tsx";

export default async function StreamingText() {
    const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

    return (
        <div className="flex flex-col items-center justify-center page h-full">
            <ComponentWrapper
                code={<CodeBlock filePath={FILE_PATH} />}
                codeString={codeString}
                doc={
                    <div className="space-y-4 text-sm leading-6 text-muted-foreground">
                        <div className="space-y-1">
                            <h2 className="text-base font-medium text-foreground">BlurredText</h2>
                            <p>
                                A streaming headline treatment for product moments, hero copy, and cinematic text reveals.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-md border bg-muted/30 p-3">
                                <p className="font-medium text-foreground">Best for</p>
                                <p>Short statements that benefit from motion and emphasis.</p>
                            </div>
                            <div className="rounded-md border bg-muted/30 p-3">
                                <p className="font-medium text-foreground">Pair with</p>
                                <p>Centered layouts, editorial pages, and onboarding moments.</p>
                            </div>
                        </div>
                    </div>
                }
                title="streaming-text.tsx"
            >
                <BlurredText
                    text="Stop acting as if life is a rehearsal."
                    className="text-4xl font-medium p-2 mx-auto text-center font-raleway"
                />
            </ComponentWrapper>
        </div>
    );
}

import { BlurredText } from "@/components/ui-components/streaming-text";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import { CodeBlock } from "@/components/docs/ui/code-block";

export default async function StreamingText() {
    return (
        <div className="flex flex-col items-center justify-center page h-full">
            <ComponentWrapper
                code={<CodeBlock filePath="components/ui-components/streaming-text.tsx" />}
            >
                <BlurredText
                    text="Stop acting as if life is a rehearsal."
                    className="text-4xl font-medium p-2 mx-auto text-center font-raleway"
                />
            </ComponentWrapper>
        </div>
    );
}

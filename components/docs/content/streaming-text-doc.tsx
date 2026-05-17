import { CodeBlock } from "@/components/docs/ui/code-block";
import { InstallationTabs } from "@/components/docs/ui/installation-tabs";
import { ComponentWrapper } from "@/components/ui/component-wrapper";
import { BlurredText } from "@/components/ui-components/streaming-text";
import { promises as fs } from "node:fs";
import path from "node:path";

const FILE_PATH = "components/ui-components/streaming-text.tsx";

export async function StreamingTextDoc() {
  const codeString = await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf-8");

  return (
    <ComponentWrapper
      code={<CodeBlock filePath={FILE_PATH} />}
      codeString={codeString}
      doc={
        <div className="w-full space-y-8 text-sm leading-6 text-muted-foreground">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border bg-background p-4">
              <h3 className="font-medium text-foreground">Inspiration</h3>
              <p className="mt-2">
                Built for concise hero lines, empty states, onboarding beats, and editorial pages
                where the text should arrive with a little ceremony.
              </p>
            </div>
            <div className="rounded-md border bg-background p-4">
              <h3 className="font-medium text-foreground">Behavior</h3>
              <p className="mt-2">
                Splits the copy into words, then uses Motion variants to stagger opacity and blur
                for a smooth left-to-right reveal.
              </p>
            </div>
            <div className="rounded-md border bg-background p-4">
              <h3 className="font-medium text-foreground">Customization</h3>
              <p className="mt-2">
                Tune the element tag, duration, delay, stagger, blur radius, wrapper class, and
                per-word class from props.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-medium text-foreground">Dependencies</h3>
            <div className="flex flex-wrap gap-2">
              <code className="rounded-md border bg-muted px-2 py-1 font-mono text-xs text-foreground">
                motion
              </code>
              <code className="rounded-md border bg-muted px-2 py-1 font-mono text-xs text-foreground">
                react
              </code>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border bg-background p-4 md:col-span-2">
              <h3 className="font-medium text-foreground">Installation</h3>
              <div className="mt-3">
                <InstallationTabs
                  cliCommands={["@skecherui/streaming-text"]}
                  dependencies={["motion"]}
                  manualSteps={
                    <div className="space-y-3">
                      <p>
                        Create the component file below, then import{" "}
                        <code className="font-mono text-foreground">BlurredText</code> wherever
                        you want to reveal text.
                      </p>
                      <details className="group rounded-md border bg-muted/30" open>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 font-mono text-xs text-foreground">
                          {FILE_PATH}
                          <span className="text-muted-foreground transition-transform group-open:rotate-180">
                            v
                          </span>
                        </summary>
                        <div className="max-h-96 overflow-hidden border-t bg-background">
                          <CodeBlock className="max-h-96" filePath={FILE_PATH} />
                        </div>
                      </details>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      }
      title="streaming-text.tsx"
    >
      <BlurredText
        text="Stop acting as if life is a rehearsal."
        className="mx-auto p-2 text-center font-raleway text-4xl font-medium"
      />
    </ComponentWrapper>
  );
}


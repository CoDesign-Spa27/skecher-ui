import { ComponentPreviewControls } from "@/components/docs/content/component-preview-controls";
import { SuperIsland } from "@/components/docs/super-island";
import { CodeBlock } from "@/components/docs/ui/code-block";
import { CodeCollapsibleWrapper } from "@/components/docs/ui/code-collapsible-wrapper";
import type { ComponentDoc } from "@/lib/docs-content";

function ComponentFileBlocks({ files, importName }: Pick<ComponentDoc, "files" | "importName">) {
  return (
    <div className="min-w-0 max-w-full space-y-3">
      <p>
        Create the required file{files.length > 1 ? "s" : ""} below, then import{" "}
        <code className="font-mono text-foreground">{importName}</code> wherever you want to use the
        component.
      </p>
      {files.map((file) => (
        <details
          className="group min-w-0 max-w-full overflow-hidden rounded-md border bg-muted/30"
          key={file.path}
          open
        >
          <summary className="flex min-w-0 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 font-mono text-xs text-foreground">
            <span className="min-w-0 flex-1 truncate">
              {/*{file.path}*/}
              {file.description ? (
                <span className="ml-2 hidden sm:inline">{file.description}</span>
              ) : null}
            </span>
          </summary>
          <div className="no-scrollbar min-w-0 overflow-x-auto border-t bg-background">
            <CodeCollapsibleWrapper>
              <CodeBlock filePath={file.path} />
            </CodeCollapsibleWrapper>
          </div>
        </details>
      ))}
    </div>
  );
}

export function ComponentDocSections({ page }: { page: ComponentDoc }) {
  const manualDependencies =
    page.installDependencies ?? page.dependencies.filter((dependency) => dependency !== "react");

  return (
    <SuperIsland
      cliCommands={[page.cliCommand]}
      componentDescription={page.description}
      componentName={page.title}
      dependencies={manualDependencies}
      docked
      files={page.files}
      importName={page.importName}
      manualSteps={<ComponentFileBlocks files={page.files} importName={page.importName} />}
      previewControls={<ComponentPreviewControls slug={page.slug} />}
    />
  );
}

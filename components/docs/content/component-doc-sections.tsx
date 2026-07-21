import { SuperIsland } from "@/components/docs/super-island";
import { CodeSnippet } from "@/components/docs/ui/code-snippet";
import { UsageCodeBlock } from "@/components/docs/ui/usage-code-block";
import type { ComponentDoc } from "@/lib/docs-content";

function ComponentFileBlocks({ files }: Pick<ComponentDoc, "files">) {
  return (
    <div className="min-w-0 max-w-full space-y-3">
      <p>Component Code</p>
      {files.map((file) => (
        <CodeSnippet
          ariaLabel={`Copy ${file.path} code`}
          collapsible
          filePath={file.path}
          key={file.path}
        />
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
      manualSteps={<ComponentFileBlocks files={page.files} />}
      usageExample={<UsageCodeBlock code={page.usage} />}
    />
  );
}

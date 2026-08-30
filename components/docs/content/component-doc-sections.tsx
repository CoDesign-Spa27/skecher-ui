import { SuperIsland } from "@/components/docs/super-island";
import { CodeSnippet } from "@/components/docs/ui/code-snippet";
import { UsageCodeBlock } from "@/components/docs/ui/usage-code-block";
import type { ComponentDoc } from "@/lib/docs-content";

function ComponentFileBlocks({
  files,
  assets,
  details,
}: Pick<ComponentDoc, "files" | "assets" | "details">) {
  return (
    <div className="min-w-0 max-w-full space-y-5">
      {details.length ? (
        <div className="space-y-3">
          <p>Implementation details</p>
          <div className="grid gap-2">
            {details.map((detail) => (
              <div className="rounded-lg bg-muted/40 px-3 py-2" key={detail.title}>
                <p className="text-sm font-medium text-foreground">{detail.title}</p>
                <p className="mt-1 text-xs leading-relaxed">{detail.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <p>Component code</p>
        {files.map((file) => (
          <CodeSnippet
            ariaLabel={`Copy ${file.path} code`}
            collapsible
            filePath={file.path}
            key={file.path}
          />
        ))}
      </div>

      {assets?.length ? (
        <div className="space-y-2">
          <p>Required assets</p>
          <ul className="space-y-2">
            {assets.map((asset) => (
              <li className="rounded-lg bg-muted/40 px-3 py-2" key={asset.path}>
                <code className="font-mono text-xs text-foreground">{asset.path}</code>
                {asset.description ? <p className="mt-1 text-xs">{asset.description}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
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
      manualSteps={
        <ComponentFileBlocks assets={page.assets} details={page.details} files={page.files} />
      }
      usageExample={<UsageCodeBlock code={page.usage} />}
    />
  );
}

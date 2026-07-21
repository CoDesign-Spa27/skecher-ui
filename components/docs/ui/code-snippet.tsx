import { promises as fs } from "node:fs";
import path from "node:path";

import CopyButton from "@/components/docs/ui/copy-button";
import { cn } from "@/lib/utils";

import { CodeBlock } from "./code-block";
import { CodeCollapsibleWrapper } from "./code-collapsible-wrapper";

type CodeSnippetProps = {
  ariaLabel?: string;
  className?: string;
  codeClassName?: string;
  collapsible?: boolean;
} & ({ filePath: string; source?: never } | { filePath?: never; source: string });

export async function CodeSnippet({
  ariaLabel = "Copy code",
  className,
  codeClassName,
  collapsible = false,
  filePath,
  source,
}: CodeSnippetProps) {
  const code = source ?? (await fs.readFile(path.join(process.cwd(), filePath), "utf-8"));
  const highlightedCode = <CodeBlock className={codeClassName} source={code} />;

  return (
    <div
      className={cn(
        "no-scrollbar relative min-w-0 overflow-x-auto rounded-2xl bg-neutral-100 dark:bg-accent/50",
        className,
      )}
      data-code-snippet
    >
      <CopyButton
        ariaLabel={ariaLabel}
        className="sidebar-shadow absolute top-2 right-2 z-20 size-7 rounded-md bg-accent"
        code={code}
      />
      {collapsible ? (
        <CodeCollapsibleWrapper>{highlightedCode}</CodeCollapsibleWrapper>
      ) : (
        highlightedCode
      )}
    </div>
  );
}

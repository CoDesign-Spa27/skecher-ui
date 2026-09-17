import { promises as fs } from "node:fs";
import path from "node:path";

import CopyButton from "@/components/docs/ui/copy-button";
import { cn } from "@/lib/utils";

import { CodeBlock, type CodeBlockProps } from "./code-block";
import { CodeCollapsibleWrapper } from "./code-collapsible-wrapper";

type CodeSnippetProps = {
  ariaLabel?: string;
  className?: string;
  codeClassName?: string;
  collapsible?: boolean;
  highlightLines?: CodeBlockProps["highlightLines"];
  language?: CodeBlockProps["language"];
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
} & ({ filePath: string; source?: never } | { filePath?: never; source: string });

export async function CodeSnippet({
  ariaLabel = "Copy code",
  className,
  codeClassName,
  collapsible = false,
  filePath,
  highlightLines,
  language = "tsx",
  showCopyButton = true,
  showLineNumbers = true,
  source,
}: CodeSnippetProps) {
  const rawCode = source ?? (await fs.readFile(path.join(process.cwd(), filePath), "utf-8"));
  const code = rawCode.replace(/^\n+/, "").trimEnd();
  const label = filePath ?? language;
  const highlightedCode = (
    <CodeBlock
      ariaLabel={`${label} code`}
      className={codeClassName}
      highlightLines={highlightLines}
      language={language}
      scrollMode="horizontal"
      showLineNumbers={showLineNumbers}
      source={code}
    />
  );

  return (
    <div
      className={cn(
        "relative min-w-0 overflow-clip rounded-2xl bg-neutral-100 text-left dark:bg-accent/50",
        className,
      )}
      data-code-snippet
    >
      {showCopyButton ? (
        <CopyButton
          ariaLabel={ariaLabel}
          className="sidebar-shadow absolute top-2 right-2 z-20 size-7 rounded-md bg-accent"
          code={code}
          source="component_code"
        />
      ) : null}
      {collapsible ? (
        <CodeCollapsibleWrapper>{highlightedCode}</CodeCollapsibleWrapper>
      ) : (
        highlightedCode
      )}
    </div>
  );
}

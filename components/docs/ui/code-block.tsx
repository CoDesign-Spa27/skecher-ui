import { promises as fs } from "node:fs";
import path from "node:path";

import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { type BundledLanguage, codeToHast } from "shiki";

import { cn } from "@/lib/utils";

export type CodeBlockProps = {
  ariaLabel?: string;
  className?: string;
  highlightLines?: readonly number[];
  language?: BundledLanguage;
  scrollMode?: "both" | "horizontal";
  showLineNumbers?: boolean;
} & ({ filePath: string; source?: never } | { filePath?: never; source: string });

export async function CodeBlock({
  ariaLabel,
  className,
  filePath,
  highlightLines,
  language = "tsx",
  scrollMode = "both",
  showLineNumbers = true,
  source,
}: CodeBlockProps) {
  const rawCode = source ?? (await fs.readFile(path.join(process.cwd(), filePath), "utf-8"));
  const code = rawCode.replace(/^\n+/, "").trimEnd();
  const highlightedLines = new Set(highlightLines);
  const hast = await codeToHast(code, {
    lang: language,
    themes: {
      dark: "github-dark",
      light: "github-light",
    },
    defaultColor: false,
    transformers: [
      {
        line(node, line) {
          node.properties["data-line"] = line;

          if (highlightedLines.has(line)) {
            node.properties["data-highlighted"] = true;
          }
        },
      },
    ],
  });
  const nodes = toJsxRuntime(hast, { Fragment, jsx, jsxs });

  return (
    <section
      aria-label={ariaLabel ?? `${language} code`}
      className={cn(
        "w-full min-w-0 max-w-full text-sm outline-none selection:bg-highlight/20 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring/50 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]",
        scrollMode === "both"
          ? "h-full min-h-0 overflow-auto overscroll-contain"
          : "h-auto overflow-x-auto overflow-y-visible overscroll-x-contain overscroll-y-auto",
        "[&_code]:block [&_code]:font-mono [&_.line]:inline-block [&_.line]:min-w-full",
        "[&_.line[data-highlighted]]:bg-highlight/10 [&_.line[data-highlighted]]:shadow-[inset_2px_0_var(--highlight)]",
        showLineNumbers &&
          "[&_.line]:before:mr-4 [&_.line]:before:inline-block [&_.line]:before:w-[3ch] [&_.line]:before:text-right [&_.line]:before:text-muted-foreground/55 [&_.line]:before:content-[attr(data-line)] [&_.line]:before:select-none",
        "[&_pre]:m-0 [&_pre]:min-h-full [&_pre]:w-max [&_pre]:min-w-full [&_pre]:overflow-visible [&_pre]:bg-transparent! [&_pre]:p-4 sm:[&_pre]:p-5",
        className,
      )}
      data-vaul-no-drag
    >
      {nodes}
    </section>
  );
}

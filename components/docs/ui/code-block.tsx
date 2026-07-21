import { promises as fs } from "node:fs";
import path from "node:path";

import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki";

import { cn } from "@/lib/utils";

type CodeBlockProps = {
  className?: string;
} & ({ filePath: string; source?: never } | { filePath?: never; source: string });

export async function CodeBlock({ className, filePath, source }: CodeBlockProps) {
  const code = source ?? (await fs.readFile(path.join(process.cwd(), filePath), "utf-8"));
  const hast = await codeToHast(code, {
    lang: "tsx",
    themes: {
      dark: "github-dark",
      light: "github-light",
    },
    defaultColor: false,
  });
  const nodes = toJsxRuntime(hast, { Fragment, jsx, jsxs });

  // Prevent horizontal scrollbar by allowing code/pre to wrap lines and removing overflow-x
  // Style allows code/pre to visually wrap; Tailwind "break-words" and "whitespace-pre-wrap" may be used.
  return (
    <div
      className={cn(
        "no-scrollbar h-full w-full min-w-0 max-w-full overflow-hidden text-sm [&_code]:font-mono [&_pre]:max-w-full [&_pre]:min-h-full [&_pre]:overflow-hidden [&_pre]:bg-transparent! [&_pre]:p-4 sm:[&_pre]:p-5 ",
        className,
      )}
    >
      {nodes}
    </div>
  );
}

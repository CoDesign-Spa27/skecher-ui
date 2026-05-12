import { codeToHast } from "shiki";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function CodeBlock({ filePath }: { filePath: string }) {
    const source = await fs.readFile(path.join(process.cwd(), filePath), "utf-8");
    const hast = await codeToHast(source, {
        lang: "tsx",
        themes: {
            dark: "github-dark",
            light: "github-light",
        },
        defaultColor: false,
    });
    const nodes = toJsxRuntime(hast, { Fragment, jsx, jsxs });
    return (
        <div className="text-sm overflow-auto rounded-lg h-full [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:h-full">
            {nodes}
        </div>
    );
}

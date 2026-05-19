import Image from "next/image";
import { codeToHast } from "shiki";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { CodeBlock } from "@/components/docs/ui/code-block";
import { InstallationTabs } from "@/components/docs/ui/installation-tabs";
import CopyButton from "@/components/docs/ui/copy-button";
import { cn } from "@/lib/utils";
import type { ComponentDoc } from "@/lib/docs-content";

type DependencyIcon = {
  src: string;
  alt: string;
  label: string;
};

const DEPENDENCY_ICONS: Record<string, DependencyIcon> = {
  motion: {
    src: "/dependecies/motion.png",
    alt: "Motion",
    label: "Motion",
  },
  react: {
    src: "/dependecies/react.svg",
    alt: "React",
    label: "React",
  },
  tailwind: {
    src: "/dependecies/tailwind.svg",
    alt: "Tailwind CSS",
    label: "Tailwind CSS",
  },
  typescript: {
    src: "/dependecies/typescript.svg",
    alt: "TypeScript",
    label: "TypeScript",
  },
};

function getDependencyIcon(dependency: string) {
  return DEPENDENCY_ICONS[dependency.toLowerCase()];
}

function ComponentDetails({ details }: Pick<ComponentDoc, "details">) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {details.map((detail) => (
        <div className="rounded-md border bg-background p-4" key={detail.title}>
          <h3 className="font-medium text-foreground">{detail.title}</h3>
          <p className="mt-2">{detail.body}</p>
        </div>
      ))}
    </div>
  );
}

function ComponentDependencies({ dependencies }: Pick<ComponentDoc, "dependencies">) {
  if (!dependencies.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium text-foreground">Dependencies</h3>
      <div className="flex flex-wrap gap-2">
        {dependencies.map((dependency) => {
          const icon = getDependencyIcon(dependency);

          return (
            <span
              className="flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1.5 font-mono text-xs text-foreground"
              key={dependency}
            >
              {icon ? (
                <span className="flex size-4 items-center justify-center rounded-sm bg-background/80">
                  <Image
                    alt={`${icon.alt} icon`}
                    className="size-3.5 object-contain"
                    height={14}
                    src={icon.src}
                    width={14}
                  />
                </span>
              ) : null}
              {icon?.label ?? dependency}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ComponentFileBlocks({ files, importName }: Pick<ComponentDoc, "files" | "importName">) {
  return (
    <div className="space-y-3">
      <p>
        Create the required file{files.length > 1 ? "s" : ""} below, then import{" "}
        <code className="font-mono text-foreground">{importName}</code> wherever you want to use
        the component.
      </p>
      {files.map((file) => (
        <details className="group rounded-md border bg-muted/30" key={file.path} open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 font-mono text-xs text-foreground">
            <span>
              {file.path}
              {file.description ? (
                <span className="ml-2 font-sans text-muted-foreground">{file.description}</span>
              ) : null}
            </span>
            <span className="text-muted-foreground transition-transform group-open:rotate-180">
              v
            </span>
          </summary>
          <div className="max-h-96 overflow-hidden border-t bg-background">
            <CodeBlock className="max-h-96" filePath={file.path} />
          </div>
        </details>
      ))}
    </div>
  );
}

function ComponentInstallation({
  cliCommand,
  dependencies,
  installDependencies,
  files,
  importName,
}: Pick<
  ComponentDoc,
  "cliCommand" | "dependencies" | "installDependencies" | "files" | "importName"
>) {
  const manualDependencies =
    installDependencies ?? dependencies.filter((dependency) => dependency !== "react");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-md border-0 bg-background p-4 md:col-span-2">
        <h3 className="font-medium text-foreground">Installation</h3>
        <div className="mt-3">
          <InstallationTabs
            cliCommands={[cliCommand]}
            dependencies={manualDependencies}
            manualSteps={<ComponentFileBlocks files={files} importName={importName} />}
          />
        </div>
      </div>
    </div>
  );
}

async function InlineCodeBlock({
  code,
  title,
  className,
}: {
  code: string;
  title: string;
  className?: string;
}) {
  const hast = await codeToHast(code, {
    lang: "tsx",
    themes: {
      dark: "github-dark",
      light: "github-light",
    },
    defaultColor: false,
  });
  const nodes = toJsxRuntime(hast, { Fragment, jsx, jsxs });

  return (
    <div className={cn("overflow-hidden rounded-md border bg-background", className)}>
      <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-3 py-2">
        <span className="font-mono text-xs text-foreground">{title}</span>
        <CopyButton className="-my-1" code={code} />
      </div>
      <div className="no-scrollbar max-h-96 overflow-auto text-sm [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-4">
        {nodes}
      </div>
    </div>
  );
}

async function ComponentUsage({ usage }: Pick<ComponentDoc, "usage">) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-medium text-foreground">Usage</h3>
      <div className="space-y-4">
        <InlineCodeBlock code={usage.imports} title="Import" />
        <InlineCodeBlock code={usage.code} title="Usage" />
      </div>
    </section>
  );
}

export function ComponentDocSections({ page }: { page: ComponentDoc }) {
  return (
    <div className="w-full space-y-8 text-sm leading-6 text-muted-foreground">
      <ComponentDetails details={page.details} />
      <ComponentDependencies dependencies={page.dependencies} />
      <ComponentInstallation
        cliCommand={page.cliCommand}
        dependencies={page.dependencies}
        installDependencies={page.installDependencies}
        files={page.files}
        importName={page.importName}
      />
      <ComponentUsage usage={page.usage} />
    </div>
  );
}

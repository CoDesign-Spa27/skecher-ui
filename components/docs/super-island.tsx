"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { IconSquareMinusFillDuo18 } from "nucleo-ui-essential-fill-duo-18";
import * as React from "react";
import { createPortal } from "react-dom";

import { BunIcon, NpmIcon, PnpmIcon, YarnIcon } from "@/assets/code-block/icons";
import { useSuperIslandLayout } from "@/components/docs/super-island-layout";
import CopyButton from "@/components/docs/ui/copy-button";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";

import { ProgressiveScrollArea } from "../ui/ProgressiveBlueWithCss";

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";
type CommandKind = "cli" | "dependencies";

type ComponentFile = {
  path: string;
  description?: string;
};

type SuperIslandProps = {
  cliCommands: string[];
  dependencies?: string[];
  manualSteps?: React.ReactNode;
  componentName?: string;
  componentDescription?: string;
  importName?: string;
  files?: ComponentFile[];
  usageExample?: React.ReactNode;
  className?: string;
  docked?: boolean;
};

const packageManagers: PackageManager[] = ["npm", "yarn", "pnpm", "bun"];

const packageMeta: Record<
  PackageManager,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }
> = {
  npm: {
    label: "npm",
    icon: NpmIcon,
    color: "text-red-400",
  },
  yarn: {
    label: "Yarn",
    icon: YarnIcon,
    color: "text-blue-400",
  },
  pnpm: {
    label: "pnpm",
    icon: PnpmIcon,
    color: "text-yellow-400",
  },
  bun: {
    label: "Bun",
    icon: BunIcon,
    color: "text-orange-300",
  },
};

const modeOptions = [
  { label: "CLI", value: "cli" },
  { label: "Details", value: "manual" },
] as const;

const dependencyIcons: Record<string, string> = {
  motion: "/dependecies/motion.webp",
  "nucleo-ui-essential-fill-18": "/dependecies/nucleo-icons.webp",
  "nucleo-ui-essential-fill-duo-18": "/dependecies/nucleo-icons.webp",
};

const packageCommands: Record<CommandKind, Record<PackageManager, string>> = {
  cli: {
    npm: "npx shadcn@latest add",
    yarn: "yarn shadcn@latest add",
    pnpm: "pnpm dlx shadcn@latest add",
    bun: "bunx --bun shadcn@latest add",
  },
  dependencies: {
    npm: "npm install",
    yarn: "yarn add",
    pnpm: "pnpm add",
    bun: "bun add",
  },
};

function getCommand(kind: CommandKind, packageManager: PackageManager, commands: string[]) {
  return `${packageCommands[kind][packageManager]} ${commands.join(" ")}`.trim();
}

function getNextPackageManager(packageManager: PackageManager) {
  const currentIndex = packageManagers.indexOf(packageManager);
  return packageManagers[(currentIndex + 1) % packageManagers.length] ?? "npm";
}

function PackageButton({
  packageManager,
  onSwitch,
  animateKey,
}: {
  packageManager: PackageManager;
  onSwitch: () => void;
  animateKey: string;
}) {
  const Icon = packageMeta[packageManager].icon;
  const nextPackageManager = getNextPackageManager(packageManager);

  return (
    <button
      aria-label={`Switch from ${packageMeta[packageManager].label} to ${
        packageMeta[nextPackageManager].label
      }`}
      className={cn(
        "  flex h-8 w-[50px] shrink-0 items-center justify-center rounded-lg bg-[#F1F1F1] dark:bg-input/30",
        "transition-[transform,background-color,color] duration-150 ease-sidebar active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131313] focus-visible:outline-none",
        packageMeta[packageManager].color ?? "",
      )}
      onClick={onSwitch}
      title={`Switch to ${packageMeta[nextPackageManager].label}`}
      type="button"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0.4, filter: "blur(4px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        exit={{ scale: 0.5, opacity: 0.4, filter: "blur(4px)" }}
        transition={{ duration: 0.1 }}
        key={animateKey}
      >
        <Icon className="h-[20px] w-[40px]" />
      </motion.div>
      <span className="sr-only">{packageMeta[packageManager].label}</span>
    </button>
  );
}

function CommandIsland({
  commands,
  kind,
  className,
  connected = false,
}: {
  commands: string[];
  kind: CommandKind;
  className?: string;
  connected?: boolean;
}) {
  const { packageManager, setConfig } = useConfig();
  const command = getCommand(kind, packageManager, commands);

  const switchPackageManager = React.useCallback(() => {
    setConfig({ packageManager: getNextPackageManager(packageManager) });
  }, [packageManager, setConfig]);

  return (
    <div
      className={cn(
        connected
          ? "flex h-10 w-full min-w-0 items-center gap-1 rounded-xl bg-transparent px-1"
          : "header-shadow flex h-10 w-full min-w-0 items-center gap-1 rounded-xl bg-sidebar px-1",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <PackageButton
          packageManager={packageManager}
          onSwitch={switchPackageManager}
          animateKey={packageManager}
          key={packageManager}
        />
      </AnimatePresence>
      <div className="min-w-0 flex-1 px-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={packageManager}
            className="truncate font-raleway text-sm leading-[19px] font-normal text-muted-foreground"
            title={command}
            initial={{ opacity: 0.4, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0.4, filter: "blur(4px)" }}
            transition={{ duration: 0.1 }}
          >
            {command}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="flex h-8 w-14 shrink-0 items-center justify-center rounded-lg bg-[#F1F1F1] text-foreground dark:bg-input/30 input-shadow">
        <CopyButton
          className="size-full rounded-lg text-current hover:bg-transparent! dark:hover:bg-transparent!"
          code={command}
        />
      </div>
    </div>
  );
}

function ModeSwitch({
  animated,
  manualOpen,
  manualPanelId,
  onCliSelect,
  onManualOpen,
  connected = false,
}: {
  animated: boolean;
  manualOpen: boolean;
  manualPanelId: string;
  onCliSelect: (animated: boolean) => void;
  onManualOpen: (animated: boolean) => void;
  connected?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const activeMode = manualOpen ? "manual" : "cli";
  const pillTransition = !animated
    ? { duration: 0 }
    : shouldReduceMotion
      ? { duration: 0 }
      : { type: "spring" as const, bounce: 0, duration: 0.24 };
  const textTransition = { duration: animated ? (shouldReduceMotion ? 0.08 : 0.16) : 0 };

  return (
    <div
      className={cn(
        "relative flex h-[34px] shrink-0 items-center p-1 font-raleway text-base font-semibold text-foreground",
        connected
          ? "w-[210px] justify-center rounded-[10px] bg-transparent"
          : "input-shadow w-[156px] rounded-lg border border-sidebar-border dark:bg-input/30",
      )}
    >
      {modeOptions.map((mode) => {
        const isActive = activeMode === mode.value;
        const button = (
          <button
            aria-controls={mode.value === "manual" ? manualPanelId : undefined}
            aria-expanded={mode.value === "manual" ? manualOpen : undefined}
            aria-pressed={isActive}
            className={cn(
              "relative isolate flex h-[26px] shrink-0 items-center justify-center rounded-[7px] text-sm text-foreground outline-none transition-transform duration-150 ease-sidebar active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:transition-none motion-reduce:active:scale-100",
              connected ? "w-[70px]" : "w-[74px]",
            )}
            key={mode.value}
            onClick={(event) => {
              const animated = event.detail !== 0;
              if (mode.value === "manual") {
                onManualOpen(animated);
              } else {
                onCliSelect(animated);
              }
            }}
            style={{ transformStyle: "preserve-3d" }}
            type="button"
          >
            {isActive ? (
              <motion.span
                aria-hidden="true"
                className={cn(
                  "absolute bottom-0.5 left-1/2 h-[10px] -translate-x-1/2 rounded-[7px]",
                  connected
                    ? "w-[30px] h-1 bg-muted-foreground/50 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_1px_2px_rgb(0_0_0/0.2)] dark:bg-background/5"
                    : " h-2 header-shadow w-[75px] bg-[#F1F1F1] dark:bg-input/30",
                )}
                layoutId="super-island-mode-pill"
                transition={pillTransition}
              />
            ) : null}
            <motion.span
              animate={{
                opacity: isActive ? 1 : 0.62,
                transform:
                  isActive && !shouldReduceMotion
                    ? "translate3d(0px, -0.5px, 0px) scale3d(1, 1, 1)"
                    : "translate3d(0px, 0px, 0px) scale3d(0.98, 0.98, 1)",
              }}
              className="relative z-10 block leading-none mb-3"
              transition={textTransition}
            >
              {mode.label}
            </motion.span>
          </button>
        );

        return <React.Fragment key={mode.value}>{button}</React.Fragment>;
      })}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1 rounded-md bg-muted/30 p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function DependencyList({ dependencies }: { dependencies: string[] }) {
  const iconDependencies = Array.from(
    dependencies
      .reduce((groups, dependency) => {
        const icon = dependencyIcons[dependency];
        if (!icon) return groups;

        const group = groups.get(icon) ?? { icon, names: [] };
        group.names.push(dependency);
        groups.set(icon, group);
        return groups;
      }, new Map<string, { icon: string; names: string[] }>())
      .values(),
  );

  if (!iconDependencies.length) {
    return <span className="text-muted-foreground">No extra packages</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {iconDependencies.map((dependency) => (
        <span
          className="input-shadow flex size-11 items-center justify-center rounded-xl bg-background/80 p-2 dark:bg-input/30"
          key={dependency.icon}
          title={dependency.names.join(", ")}
        >
          <Image
            alt={dependency.names.join(" and ")}
            className="size-full object-contain rounded-lg"
            height={28}
            src={dependency.icon}
            width={28}
          />
        </span>
      ))}
    </div>
  );
}

function ManualPanelContent({
  dependencies,
  manualSteps,
  componentName,
  componentDescription,
  usageExample,
  onClose,
  titleId,
}: Omit<SuperIslandProps, "cliCommands" | "className"> & {
  dependencies: string[];
  onClose: (animated: boolean) => void;
  titleId: string;
}) {
  const hasDependencyIcons = dependencies.some((dependency) => dependencyIcons[dependency]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <ProgressiveScrollArea
        className="no-scrollbar relative min-h-0 flex-1 overflow-hidden px-5"
        blurHeight="160px"
        blurLevels={[0.5, 1, 2, 4, 8, 16, 32, 64]}
        viewportClassName="touch-pan-y"
      >
        <div className="flex items-center justify-between space-y-8 pt-[50%]">
          <div className="min-w-0 space-y-1.5">
            <h2 className="font-raleway text-base font-semibold text-foreground" id={titleId}>
              {componentName}
            </h2>
            <p className="text-sm leading-5 text-muted-foreground">
              Package details, usage, and installation.
            </p>
          </div>
          <Button
            aria-label="Close component details"
            className="size-8 shrink-0 rounded-md text-muted-foreground transition-[color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-foreground active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            onClick={(event) => onClose(event.detail !== 0)}
            size="icon"
            tooltip="Close"
            type="button"
            variant="ghost"
          >
            <IconSquareMinusFillDuo18 className="size-5" />
          </Button>
        </div>

        <div className="space-y-8 px-1 pb-8">
          <section className="space-y-1">
            <h3 className="text-sm font-medium text-foreground">About this component</h3>

            {componentDescription ? (
              <p className="max-w-[65ch] text-sm leading-6 text-muted-foreground">
                {componentDescription}
              </p>
            ) : null}
          </section>

          <dl className="grid gap-2">
            {/*<DetailRow label="Component" value={componentName} />
    
            <DetailRow
              label="Import"
              value={
                importName ? (
                  <code className="break-all font-mono text-xs text-foreground">
                    {importName}
                  </code>
                ) : null
              }
            />
    
            <DetailRow
              label="Files"
              value={
                files?.length ? (
                  <span>
                    {files.length} file{files.length === 1 ? "" : "s"}
                  </span>
                ) : null
              }
            />*/}

            <DetailRow
              label="Dependencies"
              value={hasDependencyIcons ? <DependencyList dependencies={dependencies} /> : null}
            />
          </dl>

          {dependencies.length ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-foreground">Install dependencies</h3>
              </div>
              <CommandIsland
                commands={dependencies}
                kind="dependencies"
                className="w-full max-w-xl"
              />
            </section>
          ) : null}

          {manualSteps ? (
            <section className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Add files</h3>

              <div className="text-sm leading-6 text-muted-foreground">{manualSteps}</div>
            </section>
          ) : null}

          {usageExample ? (
            <section className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">Use the component</h3>
                <p className="text-xs leading-5 text-muted-foreground">
                  Copy this complete example, then adjust its content for your project.
                </p>
              </div>
              {usageExample}
            </section>
          ) : null}
        </div>
      </ProgressiveScrollArea>
    </div>
  );
}

type PanelMotionSettings = {
  animated: boolean;
  reduced: boolean;
};

function getPanelTransition(settings: PanelMotionSettings, closing = false) {
  if (!settings.animated) {
    return { duration: 0 };
  }

  if (settings.reduced) {
    return { duration: 0 };
  }

  return {
    type: "spring" as const,
    bounce: 0,
    duration: closing ? 0.28 : 0.34,
  };
}

const panelVariants = {
  initial: (settings: PanelMotionSettings) => ({
    transform:
      settings.animated && !settings.reduced
        ? "translate3d(100%, 0px, 0px)"
        : "translate3d(0px, 0px, 0px)",
  }),
  open: (settings: PanelMotionSettings) => ({
    transform: "translate3d(0px, 0px, 0px)",
    transition: getPanelTransition(settings),
  }),
  closed: (settings: PanelMotionSettings) => ({
    transform:
      settings.animated && !settings.reduced
        ? "translate3d(100%, 0px, 0px)"
        : "translate3d(0px, 0px, 0px)",
    transition: getPanelTransition(settings, true),
  }),
};

function ConnectedIslandFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative mx-auto h-[78px] w-full max-w-[511px]", className)}
      data-super-island
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 511 78"
      >
        <path
          d="M12.5 1H498.5C504.9 1 510 6.1 510 12.5V27.5C510 33.9 504.9 39 498.5 39H367C354.2 39 348.8 45.1 344.1 55.7L341.1 63.6C338.3 72.2 331.6 77 322 77H189C179.4 77 172.7 72.2 169.9 63.6L166.9 55.7C162.2 45.1 156.8 39 144 39H12.5C6.1 39 1 33.9 1 27.5V12.5C1 6.1 6.1 1 12.5 1Z"
          fill="var(--sidebar)"
          stroke="var(--sidebar-border)"
          strokeWidth="0"
          style={{
            filter:
              "drop-shadow(0 2px 2px rgb(0 0 0 / 0.15)) drop-shadow(0 4px 8px rgb(0 0 0 / 0.12))",
          }}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M12.5 1H498.5C504.9 1 510 6.1 510 12.5V27.5C510 33.9 504.9 39 498.5 39H367C354.2 39 348.8 45.1 344.1 55.7L341.1 63.6C338.3 72.2 331.6 77 322 77H189C179.4 77 172.7 72.2 169.9 63.6L166.9 55.7C162.2 45.1 156.8 39 144 39H12.5C6.1 39 1 33.9 1 27.5V12.5C1 6.1 6.1 1 12.5 1Z"
          fill="none"
          opacity="0.55"
          stroke="rgb(255 255 255 / 0.12)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="relative z-10 flex h-full flex-col items-center">{children}</div>
    </div>
  );
}

function SuperIsland({
  cliCommands,
  dependencies = [],
  manualSteps,
  componentName = "Component",
  componentDescription,
  importName,
  files,
  usageExample,
  className,
  docked = false,
}: SuperIslandProps) {
  const sharedLayout = useSuperIslandLayout();
  const shouldReduceMotion = useReducedMotion();
  const [localState, setLocalState] = React.useState({ animated: true, manualOpen: false });
  const manualOpen = sharedLayout?.manualOpen ?? localState.manualOpen;
  const animated = sharedLayout?.animated ?? localState.animated;
  const manualPanelId = React.useId();
  const panelTitleId = `${manualPanelId}-title`;
  const motionSettings = React.useMemo(
    () => ({ animated, reduced: Boolean(shouldReduceMotion) }),
    [animated, shouldReduceMotion],
  );
  const setManualOpen = React.useCallback(
    (open: boolean, shouldAnimate = true) => {
      if (sharedLayout) {
        sharedLayout.setManualOpen(open, { animated: shouldAnimate });
      } else {
        setLocalState({ animated: shouldAnimate, manualOpen: open });
      }
    },
    [sharedLayout],
  );

  React.useEffect(() => {
    if (!manualOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setManualOpen(false, false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [manualOpen, setManualOpen]);

  const island = (
    <ConnectedIslandFrame
      className={cn(
        docked &&
          "pointer-events-auto absolute bottom-5 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 sm:bottom-7",
        className,
      )}
    >
      <CommandIsland commands={cliCommands} connected kind="cli" />
      <div className="-mt-px flex h-[39px] w-full items-start justify-center pt-[3px]">
        <ModeSwitch
          animated={animated}
          connected
          manualOpen={manualOpen}
          manualPanelId={manualPanelId}
          onCliSelect={(shouldAnimate) => setManualOpen(false, shouldAnimate)}
          onManualOpen={(shouldAnimate) => setManualOpen(true, shouldAnimate)}
        />
      </div>
    </ConnectedIslandFrame>
  );

  const renderedIsland = docked
    ? sharedLayout?.previewOverlayRoot
      ? createPortal(island, sharedLayout.previewOverlayRoot)
      : null
    : island;

  return (
    <>
      {renderedIsland}

      <AnimatePresence custom={motionSettings} initial={false} mode="popLayout">
        {manualOpen ? (
          <motion.aside
            animate="open"
            aria-labelledby={panelTitleId}
            className={cn(
              "min-h-0 overflow-hidden rounded-xl border-sidebar-border text-sidebar-foreground",
              docked
                ? "absolute inset-y-0 right-0 z-50 h-full w-[min(100%,28rem)] md:relative md:col-start-2 md:row-start-1 md:w-[min(27rem,42vw)]"
                : "mt-4 h-[min(70vh,720px)] w-full max-w-[42rem]",
            )}
            custom={motionSettings}
            data-super-island-panel=""
            exit="closed"
            id={manualPanelId}
            initial="initial"
            key="manual-panel"
            variants={panelVariants}
          >
            <ManualPanelContent
              componentDescription={componentDescription}
              componentName={componentName}
              dependencies={dependencies}
              docked={docked}
              files={files}
              importName={importName}
              manualSteps={manualSteps}
              usageExample={usageExample}
              onClose={(shouldAnimate) => setManualOpen(false, shouldAnimate)}
              titleId={panelTitleId}
            />
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export { SuperIsland };

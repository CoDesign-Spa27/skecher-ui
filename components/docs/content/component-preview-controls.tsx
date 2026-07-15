"use client";

import * as React from "react";

import { usePreviewControl } from "@/components/docs/super-island-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AiChatBox } from "@/components/ui-components/ai-chat-box";
import { AiOrb } from "@/components/ui-components/ai-orb";
import { SnapText } from "@/components/ui-components/snap-text";
import { cn } from "@/lib/utils";

const AI_ORB_DEFAULTS = {
  intensity: 1.25,
  interactive: true,
  primaryColor: "#00d9ff",
  secondaryColor: "#7c3aed",
  speed: 0.45,
};

const AI_ORB_PALETTES = [
  { label: "Neural", primary: "#00d9ff", secondary: "#7c3aed" },
  { label: "Aurora", primary: "#5cffb0", secondary: "#1677ff" },
  { label: "Solar", primary: "#ffbd38", secondary: "#ff3d81" },
  { label: "Infrared", primary: "#ff4f78", secondary: "#7b2cff" },
  { label: "Mono", primary: "#ffffff", secondary: "#667085" },
] as const;

const CHAT_DEFAULTS = {
  disabled: false,
  emptyLabel: "Let's Begin",
  placeholder: "Ask anything",
};

const SNAP_DEFAULTS = {
  indent: 48,
  itemHeight: 104,
  prefix: "We Design",
};

function ControlGroup({
  children,
  description,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label className="text-xs text-foreground">{label}</Label>
        {description ? (
          <span className="font-mono text-[11px] text-muted-foreground">{description}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function HexColorControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => setDraft(value), [value]);

  const commit = () => {
    const normalized = draft.startsWith("#") ? draft : `#${draft}`;
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      onChange(normalized.toLowerCase());
      setDraft(normalized.toLowerCase());
    } else {
      setDraft(value);
    }
  };

  return (
    <ControlGroup label={label}>
      <div className="flex items-center gap-2">
        <label
          className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-input shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50"
          style={{ backgroundColor: value }}
        >
          <span className="sr-only">Choose {label.toLowerCase()}</span>
          <input
            aria-label={`Choose ${label.toLowerCase()}`}
            className="absolute inset-[-8px] size-14 cursor-pointer opacity-0"
            onChange={(event) => onChange(event.target.value)}
            type="color"
            value={value}
          />
        </label>
        <Input
          aria-label={`${label} hex value`}
          className="font-mono uppercase"
          inputMode="text"
          onBlur={commit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
              event.currentTarget.blur();
            }
          }}
          spellCheck={false}
          value={draft}
        />
      </div>
    </ControlGroup>
  );
}

function AiOrbControls() {
  const [primaryColor, setPrimaryColor] = usePreviewControl(
    "ai-orb.primary-color",
    AI_ORB_DEFAULTS.primaryColor,
  );
  const [secondaryColor, setSecondaryColor] = usePreviewControl(
    "ai-orb.secondary-color",
    AI_ORB_DEFAULTS.secondaryColor,
  );
  const [intensity, setIntensity] = usePreviewControl(
    "ai-orb.intensity",
    AI_ORB_DEFAULTS.intensity,
  );
  const [speed, setSpeed] = usePreviewControl("ai-orb.speed", AI_ORB_DEFAULTS.speed);
  const [interactive, setInteractive] = usePreviewControl(
    "ai-orb.interactive",
    AI_ORB_DEFAULTS.interactive,
  );

  const reset = () => {
    setPrimaryColor(AI_ORB_DEFAULTS.primaryColor);
    setSecondaryColor(AI_ORB_DEFAULTS.secondaryColor);
    setIntensity(AI_ORB_DEFAULTS.intensity);
    setSpeed(AI_ORB_DEFAULTS.speed);
    setInteractive(AI_ORB_DEFAULTS.interactive);
  };

  return (
    <div className="grid gap-5">
      <ControlGroup label="Energy palette">
        <fieldset className="grid grid-cols-5 gap-2">
          <legend className="sr-only">Energy palette</legend>
          {AI_ORB_PALETTES.map((palette) => {
            const isSelected =
              palette.primary === primaryColor && palette.secondary === secondaryColor;

            return (
              <button
                aria-label={palette.label}
                aria-pressed={isSelected}
                className={cn(
                  "group relative aspect-square rounded-lg border border-input p-1 transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]",
                  isSelected && "border-foreground/60 ring-2 ring-ring/30",
                )}
                key={palette.label}
                onClick={() => {
                  setPrimaryColor(palette.primary);
                  setSecondaryColor(palette.secondary);
                }}
                title={palette.label}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="block size-full rounded-md"
                  style={{
                    background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                  }}
                />
              </button>
            );
          })}
        </fieldset>
      </ControlGroup>

      <div className="grid grid-cols-2 gap-3">
        <HexColorControl label="Primary" onChange={setPrimaryColor} value={primaryColor} />
        <HexColorControl label="Secondary" onChange={setSecondaryColor} value={secondaryColor} />
      </div>

      <ControlGroup description={intensity.toFixed(2)} label="Energy intensity">
        <Slider
          aria-label="Energy intensity"
          max={2.2}
          min={0.5}
          onValueChange={([nextValue]) => setIntensity(nextValue ?? AI_ORB_DEFAULTS.intensity)}
          step={0.05}
          value={[intensity]}
        />
      </ControlGroup>

      <ControlGroup description={`${speed.toFixed(2)}×`} label="Idle speed">
        <Slider
          aria-label="Idle speed"
          max={1.2}
          min={0}
          onValueChange={([nextValue]) => setSpeed(nextValue ?? AI_ORB_DEFAULTS.speed)}
          step={0.05}
          value={[speed]}
        />
      </ControlGroup>

      <div className="flex min-h-9 items-center justify-between gap-4">
        <div>
          <Label htmlFor="ai-orb-interactive" className="text-xs text-foreground">
            Pointer depth
          </Label>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            Gently follows fine-pointer movement.
          </p>
        </div>
        <Switch checked={interactive} id="ai-orb-interactive" onCheckedChange={setInteractive} />
      </div>

      <Button className="w-fit" onClick={reset} size="sm" type="button" variant="outline">
        Reset controls
      </Button>
    </div>
  );
}

function ChatBoxControls() {
  const [emptyLabel, setEmptyLabel] = usePreviewControl(
    "ai-chat-box.empty-label",
    CHAT_DEFAULTS.emptyLabel,
  );
  const [placeholder, setPlaceholder] = usePreviewControl(
    "ai-chat-box.placeholder",
    CHAT_DEFAULTS.placeholder,
  );
  const [disabled, setDisabled] = usePreviewControl("ai-chat-box.disabled", CHAT_DEFAULTS.disabled);

  const reset = () => {
    setEmptyLabel(CHAT_DEFAULTS.emptyLabel);
    setPlaceholder(CHAT_DEFAULTS.placeholder);
    setDisabled(CHAT_DEFAULTS.disabled);
  };

  return (
    <div className="grid gap-5">
      <ControlGroup label="Empty state">
        <Input
          aria-label="Empty state label"
          onChange={(event) => setEmptyLabel(event.target.value)}
          value={emptyLabel}
        />
      </ControlGroup>
      <ControlGroup label="Placeholder">
        <Input
          aria-label="Message placeholder"
          onChange={(event) => setPlaceholder(event.target.value)}
          value={placeholder}
        />
      </ControlGroup>
      <div className="flex min-h-9 items-center justify-between gap-4">
        <Label htmlFor="ai-chat-disabled" className="text-xs text-foreground">
          Disabled state
        </Label>
        <Switch checked={disabled} id="ai-chat-disabled" onCheckedChange={setDisabled} />
      </div>
      <Button className="w-fit" onClick={reset} size="sm" type="button" variant="outline">
        Reset controls
      </Button>
    </div>
  );
}

function SnapTextControls() {
  const [prefix, setPrefix] = usePreviewControl("snap-text.prefix", SNAP_DEFAULTS.prefix);
  const [indent, setIndent] = usePreviewControl("snap-text.indent", SNAP_DEFAULTS.indent);
  const [itemHeight, setItemHeight] = usePreviewControl(
    "snap-text.item-height",
    SNAP_DEFAULTS.itemHeight,
  );

  const reset = () => {
    setPrefix(SNAP_DEFAULTS.prefix);
    setIndent(SNAP_DEFAULTS.indent);
    setItemHeight(SNAP_DEFAULTS.itemHeight);
  };

  return (
    <div className="grid gap-5">
      <ControlGroup label="Prefix">
        <Input
          aria-label="Snap text prefix"
          onChange={(event) => setPrefix(event.target.value)}
          value={prefix}
        />
      </ControlGroup>
      <ControlGroup description={`${indent}px`} label="Row indent">
        <Slider
          aria-label="Row indent"
          max={80}
          min={16}
          onValueChange={([nextValue]) => setIndent(nextValue ?? SNAP_DEFAULTS.indent)}
          step={4}
          value={[indent]}
        />
      </ControlGroup>
      <ControlGroup description={`${itemHeight}px`} label="Row height">
        <Slider
          aria-label="Row height"
          max={132}
          min={72}
          onValueChange={([nextValue]) => setItemHeight(nextValue ?? SNAP_DEFAULTS.itemHeight)}
          step={4}
          value={[itemHeight]}
        />
      </ControlGroup>
      <Button className="w-fit" onClick={reset} size="sm" type="button" variant="outline">
        Reset controls
      </Button>
    </div>
  );
}

export function ComponentPreviewControls({ slug }: { slug: string }) {
  if (slug === "ai-orb") {
    return <AiOrbControls />;
  }

  if (slug === "ai-chat-box") {
    return <ChatBoxControls />;
  }

  if (slug === "snap-text") {
    return <SnapTextControls />;
  }

  return null;
}

export function ControlledAiOrbPreview() {
  const [primaryColor] = usePreviewControl("ai-orb.primary-color", AI_ORB_DEFAULTS.primaryColor);
  const [secondaryColor] = usePreviewControl(
    "ai-orb.secondary-color",
    AI_ORB_DEFAULTS.secondaryColor,
  );
  const [intensity] = usePreviewControl("ai-orb.intensity", AI_ORB_DEFAULTS.intensity);
  const [speed] = usePreviewControl("ai-orb.speed", AI_ORB_DEFAULTS.speed);
  const [interactive] = usePreviewControl("ai-orb.interactive", AI_ORB_DEFAULTS.interactive);

  return (
    <AiOrb
      intensity={intensity}
      interactive={interactive}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      speed={speed}
    />
  );
}

export function ControlledAiChatBoxPreview() {
  const [emptyLabel] = usePreviewControl("ai-chat-box.empty-label", CHAT_DEFAULTS.emptyLabel);
  const [placeholder] = usePreviewControl("ai-chat-box.placeholder", CHAT_DEFAULTS.placeholder);
  const [disabled] = usePreviewControl("ai-chat-box.disabled", CHAT_DEFAULTS.disabled);

  return <AiChatBox disabled={disabled} labels={{ empty: emptyLabel, input: placeholder }} />;
}

export function ControlledSnapTextPreview() {
  const [prefix] = usePreviewControl("snap-text.prefix", SNAP_DEFAULTS.prefix);
  const [indent] = usePreviewControl("snap-text.indent", SNAP_DEFAULTS.indent);
  const [itemHeight] = usePreviewControl("snap-text.item-height", SNAP_DEFAULTS.itemHeight);

  return <SnapText className="h-full" indent={indent} itemHeight={itemHeight} prefix={prefix} />;
}

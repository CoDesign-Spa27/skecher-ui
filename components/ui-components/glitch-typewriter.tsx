"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

export type GlitchTypewriterProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  /**
   * `auto` types `text` on its own. `manual` turns the line into a field the
   * reader types into, with the same per-word weight glitch.
   */
  mode?: "auto" | "manual";
  /** Auto mode: one line, or several lines typed in turn. */
  text?: string | string[];
  /** Auto mode: average delay between keystrokes, in milliseconds. Each one is jittered. */
  speed?: number;
  /** Auto mode: delay between characters while erasing, in milliseconds. */
  deleteSpeed?: number;
  /** Auto mode: how long a finished line stays before it is erased, in milliseconds. */
  hold?: number;
  /** Auto mode: erase and retype forever. */
  loop?: boolean;
  /** Manual mode: controlled value. */
  value?: string;
  /** Manual mode: starting value when uncontrolled. */
  defaultValue?: string;
  /** Manual mode: called on every keystroke. */
  onValueChange?: (value: string) => void;
  /** Manual mode: shown while the field is empty. */
  placeholder?: string;
  /** Manual mode: accessible name for the field. */
  inputLabel?: string;
  /** Manual mode: maximum number of characters. */
  maxLength?: number;
  /** Weight of letters while the word is still being typed. */
  fromWeight?: number;
  /** Weight a word settles into once it is complete. */
  toWeight?: number;
  /** The two channel colors split apart during the glitch. */
  glitchColors?: [string, string];
  /** Show the blinking caret. */
  caret?: boolean;
};

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$@01";
const GLITCH_MS = 320;
const SCRAMBLE_STEP = 40;

type Token = { value: string; start: number; end: number; space: boolean };

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let offset = 0;
  for (const value of line.split(/(\s+)/)) {
    if (!value) continue;
    tokens.push({ value, start: offset, end: offset + value.length, space: /^\s+$/.test(value) });
    offset += value.length;
  }
  return tokens;
}

export function GlitchTypewriter({
  mode = "auto",
  text = "",
  speed = 62,
  deleteSpeed = 24,
  hold = 2200,
  loop = true,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Start typing…",
  inputLabel = "Type here",
  maxLength,
  fromWeight = 300,
  toWeight = 720,
  glitchColors = ["#ff3d7f", "#22d3ee"],
  caret = true,
  className,
  ...props
}: GlitchTypewriterProps) {
  const manual = mode === "manual";
  const lines = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const linesKey = lines.join("\u0000");
  const reduceMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.4 });

  // Auto mode state.
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  // Manual mode state.
  const [draft, setDraft] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const entry = value ?? draft;

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  // Start over whenever the copy or the mode changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: linesKey stands in for the lines array.
  useEffect(() => {
    setIndex(0);
    setCount(0);
    setPhase("typing");
  }, [linesKey, mode]);

  const line = manual ? entry : (lines[index % lines.length] ?? "");

  useEffect(() => {
    if (manual || reduceMotion || !inView) return;
    let wait = 0;
    let step: () => void;

    if (phase === "typing") {
      if (count < line.length) {
        // Human rhythm: jittered keystrokes, plus a beat after each finished
        // word so its glitch can land before the next one starts.
        const justFinishedWord = count > 0 && /\s/.test(line[count - 1]) && !/\s/.test(line[count]);
        wait = speed * (0.55 + Math.random() * 0.9) + (justFinishedWord ? GLITCH_MS * 0.45 : 0);
        if (count === 0) wait += 240;
        step = () => setCount((current) => current + 1);
      } else if (loop) {
        step = () => setPhase("holding");
      } else {
        return;
      }
    } else if (phase === "holding") {
      wait = hold;
      step = () => setPhase("deleting");
    } else if (count > 0) {
      wait = deleteSpeed;
      step = () => setCount((current) => current - 1);
    } else {
      wait = 260;
      step = () => {
        setIndex((current) => (current + 1) % lines.length);
        setPhase("typing");
      };
    }

    const timer = setTimeout(step, wait);
    return () => clearTimeout(timer);
  }, [
    manual,
    count,
    phase,
    line,
    lines.length,
    speed,
    deleteSpeed,
    hold,
    loop,
    inView,
    reduceMotion,
  ]);

  const handleChange = (next: string) => {
    if (value === undefined) setDraft(next);
    onValueChange?.(next);
    setCommitted(false);
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 520);
  };

  // The field only edits at the end, so the drawn caret always matches.
  const pinCaret = () => {
    const input = inputRef.current;
    if (!input) return;
    const end = input.value.length;
    if (input.selectionStart !== end || input.selectionEnd !== end)
      input.setSelectionRange(end, end);
  };

  const tokens = useMemo(() => tokenize(line), [line]);
  const typed = manual || reduceMotion ? line.length : count;
  const idle = manual
    ? !typing
    : reduceMotion || phase === "holding" || (!loop && typed === line.length);
  const showCaret = caret && (!manual || focused);

  return (
    <div className={cn("relative", manual && "cursor-text", className)} ref={rootRef} {...props}>
      {manual ? (
        <input
          aria-label={inputLabel}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="absolute inset-0 h-full w-full cursor-text opacity-0 outline-none"
          maxLength={maxLength}
          onBlur={() => {
            setFocused(false);
            setCommitted(true);
          }}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => {
            setFocused(true);
            pinCaret();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") setCommitted(true);
          }}
          onSelect={pinCaret}
          ref={inputRef}
          spellCheck={false}
          type="text"
          value={entry}
        />
      ) : (
        <span className="sr-only">{line}</span>
      )}
      <span aria-hidden="true" className="pointer-events-none whitespace-pre-wrap">
        {manual && line.length === 0 ? (
          <span className="absolute top-0 left-0 whitespace-pre opacity-35">{placeholder}</span>
        ) : null}
        {tokens.map((token) => {
          const visible = Math.max(0, Math.min(token.value.length, typed - token.start));
          if (visible === 0) return null;
          if (token.space) return token.value.slice(0, visible);
          // A word settles once the key after it is pressed. In auto mode it
          // also settles when the line is out, and stays while erasing. In
          // manual mode the last word settles on Enter or when the field blurs.
          const whole = visible === token.value.length;
          const settled = manual
            ? whole && (typed > token.end || committed)
            : whole && (phase === "deleting" || typed > token.end || typed === line.length);
          return (
            <Word
              fromWeight={fromWeight}
              glitchColors={glitchColors}
              instant={reduceMotion}
              key={manual ? `m-${token.start}` : `${index}-${token.start}`}
              settled={settled}
              text={token.value}
              toWeight={toWeight}
              visible={visible}
            />
          );
        })}
        {showCaret ? <Caret idle={idle} /> : null}
      </span>
    </div>
  );
}

type WordProps = {
  text: string;
  visible: number;
  settled: boolean;
  fromWeight: number;
  toWeight: number;
  glitchColors: [string, string];
  instant: boolean;
};

const Word = memo(function Word({
  text,
  visible,
  settled,
  fromWeight,
  toWeight,
  glitchColors,
  instant,
}: WordProps) {
  const [burst, setBurst] = useState(0);
  const wasSettled = useRef(settled);

  useEffect(() => {
    if (settled && !wasSettled.current && !instant) setBurst((value) => value + 1);
    wasSettled.current = settled;
  }, [settled, instant]);

  // The weight stutters through a few wrong values before it locks in,
  // which reads as the glyphs being redrawn rather than smoothly tweened.
  const span = toWeight - fromWeight;
  const target = settled
    ? {
        "--glitch-w": [
          fromWeight,
          toWeight + span * 0.25,
          fromWeight + span * 0.3,
          toWeight + span * 0.1,
          fromWeight + span * 0.7,
          toWeight,
        ],
        x: [0, -1.5, 2, -1, 0.5, 0],
        filter: ["blur(0px)", "blur(3px)", "blur(0.5px)", "blur(2px)", "blur(0px)", "blur(0px)"],
      }
    : { "--glitch-w": fromWeight, x: 0, filter: "blur(0px)" };

  return (
    <motion.span
      animate={target}
      className="relative inline-block"
      initial={{ "--glitch-w": settled ? toWeight : fromWeight }}
      style={{ fontWeight: "var(--glitch-w)" } as CSSProperties}
      transition={
        instant
          ? { duration: 0 }
          : settled
            ? {
                duration: GLITCH_MS / 1000,
                ease: "linear",
                times: [0, 0.18, 0.36, 0.55, 0.76, 1],
              }
            : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }
      }
    >
      {Array.from(text.slice(0, visible), (char, i) => (
        // Each keystroke focuses in from a soft blur.
        <motion.span
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          className="inline-block whitespace-pre"
          initial={instant ? false : { opacity: 0, filter: "blur(8px)", y: "0.08em" }}
          // biome-ignore lint/suspicious/noArrayIndexKey: letters are positional and only append or pop.
          key={i}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        >
          {char}
        </motion.span>
      ))}
      {burst > 0 ? <Glitch colors={glitchColors} key={burst} text={text} /> : null}
    </motion.span>
  );
});

function randomSlices() {
  // A handful of horizontal bands, each a random strip of the word's height.
  return Array.from({ length: 4 }, () => {
    const top = Math.round(Math.random() * 70);
    const height = 8 + Math.round(Math.random() * 30);
    return `inset(${top}% 0 ${Math.max(0, 100 - top - height)}% 0)`;
  });
}

function scramble(text: string, resolved: number) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    out += i < resolved ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
}

function Glitch({ text, colors }: { text: string; colors: [string, string] }) {
  const [frame, setFrame] = useState(0);
  const [slices] = useState(() => [randomSlices(), randomSlices()]);
  const frames = Math.ceil(GLITCH_MS / SCRAMBLE_STEP);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((value) => {
        if (value >= frames) clearInterval(timer);
        return value + 1;
      });
    }, SCRAMBLE_STEP);
    return () => clearInterval(timer);
  }, [frames]);

  if (frame > frames) return null;

  // Characters resolve left to right as the burst plays out.
  const shown = scramble(text, Math.floor((frame / frames) * text.length));
  const hidden = "inset(50% 0 50% 0)";

  return (
    <>
      {colors.map((color, channel) => (
        <motion.span
          animate={{
            x: channel === 0 ? [0, -3, 2, -2, 1, 0] : [0, 3, -2, 2, -1, 0],
            clipPath: [hidden, ...slices[channel], hidden],
            opacity: [1, 1, 1, 1, 1, 0],
          }}
          className="pointer-events-none absolute top-0 left-0 whitespace-pre"
          initial={{ clipPath: hidden }}
          key={color}
          style={{ color }}
          transition={{ duration: GLITCH_MS / 1000, ease: "linear" }}
        >
          {shown}
        </motion.span>
      ))}
    </>
  );
}

function Caret({ idle }: { idle: boolean }) {
  return (
    <motion.span
      animate={idle ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }}
      className="ml-[0.06em] inline-block h-[0.95em] w-[0.08em] min-w-[2px] translate-y-[0.12em] rounded-full bg-current"
      transition={
        idle
          ? { duration: 1.05, repeat: Number.POSITIVE_INFINITY, times: [0, 0.5, 0.5, 1] }
          : { duration: 0 }
      }
    />
  );
}

export default GlitchTypewriter;

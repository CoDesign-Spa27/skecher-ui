"use client";

import { ArrowUp, Check, ChevronDown, type LucideIcon, MoreHorizontal } from "lucide-react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { IconEarthFillDuo18, IconLinkFillDuo18 } from "nucleo-ui-essential-fill-duo-18";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

const getMessageSurfaceLayoutId = (id: string) => `chat-message-surface-${id}`;

const sharedLayoutTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

const easeOut = [0.23, 1, 0.32, 1] as const;

export type AiChatModel = {
  id: string;
  name: string;
  description: string;
  capability: string;
  icon?: LucideIcon;
  iconClassName?: string;
};

const DEFAULT_MODELS: AiChatModel[] = [
  {
    id: "nova",
    name: "Nova",
    description: "Balanced for everyday ideas",
    capability: "Balanced",
  },
  {
    id: "atlas",
    name: "Atlas",
    description: "Plans and complex reasoning",
    capability: "Reasoning",
  },
  {
    id: "swift",
    name: "Swift",
    description: "Quick drafts and edits",
    capability: "Fast",
  },
];

export type AiChatMessage = {
  id: string;
  text: string;
};

export type AiChatAction = {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export type AiChatBoxLabels = {
  empty: ReactNode;
  input: string;
  inputAriaLabel: string;
  send: string;
  modelPicker: string;
};

export type AiChatBoxProps = {
  className?: string;
  models?: AiChatModel[];
  messages?: AiChatMessage[];
  defaultMessages?: AiChatMessage[];
  onMessagesChange?: (messages: AiChatMessage[]) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  selectedModelId?: string;
  defaultSelectedModelId?: string;
  onSelectedModelChange?: (modelId: string) => void;
  onSend?: (message: AiChatMessage, model?: AiChatModel) => void | Promise<void>;
  actions?: AiChatAction[];
  labels?: Partial<AiChatBoxLabels>;
  renderMessage?: (message: AiChatMessage) => ReactNode;
  emptyState?: ReactNode;
  disabled?: boolean;
  isSending?: boolean;
  maxLength?: number;
  submitOnEnter?: boolean;
};

const DEFAULT_LABELS: AiChatBoxLabels = {
  empty: "Let's Begin",
  input: "Ask anything",
  inputAriaLabel: "Message input",
  send: "Send message",
  modelPicker: "Choose a model",
};

function ComposerIconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-500 transition-[color,background-color,transform] duration-150 hover:bg-neutral-50 hover:text-neutral-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
    >
      {children}
    </button>
  );
}

function MessageSurface({
  id,
  text,
  isMorphing,
  onSurfaceAnimationComplete,
  className,
  children,
}: {
  id: string;
  text: string;
  isMorphing: boolean;
  onSurfaceAnimationComplete?: () => void;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <motion.div
      layoutId={getMessageSurfaceLayoutId(id)}
      initial={false}
      animate={{ opacity: 1 }}
      transition={sharedLayoutTransition}
      onLayoutAnimationComplete={isMorphing ? onSurfaceAnimationComplete : undefined}
      data-message-surface={id}
      data-morphing={isMorphing || undefined}
      className={cn(
        "!opacity-100 relative isolate w-full overflow-hidden rounded-[1.25rem] bg-white px-4 py-2.5 text-sm leading-relaxed text-neutral-900 shadow-sm will-change-transform dark:bg-neutral-800 dark:text-neutral-100",
        className,
      )}
    >
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: isMorphing ? 1 : 0 }}
        transition={{
          opacity: {
            duration: isMorphing ? 0.18 : 0.28,
            ease: "easeInOut",
          },
        }}
        className="pointer-events-none absolute inset-0 -z-10 bg-neutral-50 dark:bg-neutral-600"
      />
      {children ?? <p className="whitespace-pre-wrap">{text}</p>}
    </motion.div>
  );
}

function MessageBubble({
  id,
  text,
  isMorphing,
  onSurfaceAnimationComplete,
  renderMessage,
}: {
  id: string;
  text: string;
  isMorphing: boolean;
  onSurfaceAnimationComplete?: () => void;
  renderMessage?: (message: AiChatMessage) => ReactNode;
}) {
  return (
    <div className="w-full">
      <MessageSurface
        id={id}
        text={text}
        isMorphing={isMorphing}
        onSurfaceAnimationComplete={onSurfaceAnimationComplete}
      >
        {renderMessage?.({ id, text })}
      </MessageSurface>
    </div>
  );
}

function ModelPickerPanel({
  panelId,
  selectorId,
  selectedModelId,
  motionEnabled,
  onSelect,
  onClose,
  onKeyboardInteraction,
  onReturnFocus,
  models,
  ariaLabel,
}: {
  panelId: string;
  selectorId: string;
  selectedModelId: string;
  motionEnabled: boolean;
  onSelect: (modelId: string) => void;
  onClose: () => void;
  onKeyboardInteraction: () => void;
  onReturnFocus: () => void;
  models: AiChatModel[];
  ariaLabel: string;
}) {
  const optionRefs = useRef<Array<HTMLInputElement | null>>([]);
  const selectedIndex = Math.max(
    0,
    models.findIndex((model) => model.id === selectedModelId),
  );
  const [focusedModelId, setFocusedModelId] = useState(selectedModelId);
  const [cursorMotionEnabled, setCursorMotionEnabled] = useState(motionEnabled);

  useEffect(() => {
    optionRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  const selectAndFocusOption = (index: number) => {
    const normalizedIndex = (index + models.length) % models.length;
    const nextModel = models[normalizedIndex];
    setFocusedModelId(nextModel.id);
    onSelect(nextModel.id);
    optionRefs.current[normalizedIndex]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const focusedIndex = Math.max(
      0,
      models.findIndex((model) => model.id === focusedModelId),
    );

    setCursorMotionEnabled(false);
    onKeyboardInteraction();

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectAndFocusOption(focusedIndex + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectAndFocusOption(focusedIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectAndFocusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectAndFocusOption(models.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      requestAnimationFrame(onReturnFocus);
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSelect(focusedModelId);
      onClose();
      requestAnimationFrame(onReturnFocus);
    }
  };

  return (
    <motion.div
      id={panelId}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onPointerMoveCapture={() => setCursorMotionEnabled(true)}
      initial={motionEnabled ? { opacity: 0, transform: "translateY(7px) scale(0.98)" } : false}
      animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
      exit={
        motionEnabled ? { opacity: 0, transform: "translateY(4px) scale(0.985)" } : { opacity: 0 }
      }
      transition={{ duration: motionEnabled ? 0.18 : 0, ease: easeOut }}
      className="relative z-10 grid grid-cols-3 gap-1 pt-2 dark:border-neutral-700/70  bg-neutral-100 dark:bg-neutral-900 rounded-[1rem] px-2 pb-2 text-center text-xs font-medium text-neutral-900 dark:text-neutral-100"
    >
      {models.map((model, index) => {
        const isFocused = focusedModelId === model.id;
        const isSelected = selectedModelId === model.id;

        return (
          <motion.label
            key={model.id}
            onPointerMove={() => setFocusedModelId(model.id)}
            onPointerUp={() => {
              onSelect(model.id);
              onClose();
              requestAnimationFrame(onReturnFocus);
            }}
            initial={motionEnabled ? { opacity: 0, transform: "translateY(5px)" } : false}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{
              duration: motionEnabled ? 0.16 : 0,
              delay: motionEnabled ? index * 0.035 : 0,
              ease: easeOut,
            }}
            className="relative flex h-[72px] min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-1 outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sky-500/40"
          >
            <input
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="radio"
              name={`${selectorId}-model`}
              value={model.id}
              checked={isSelected}
              aria-label={`${model.name}: ${model.description}`}
              onFocus={() => setFocusedModelId(model.id)}
              onChange={() => onSelect(model.id)}
              className="sr-only"
            />

            {isFocused && (
              <motion.span
                layoutId={`${selectorId}-model-focus`}
                transition={
                  cursorMotionEnabled
                    ? { type: "spring", duration: 0.22, bounce: 0 }
                    : { duration: 0 }
                }
                className="pointer-events-none absolute inset-0 rounded-[1rem]  bg-neutral-200 dark:bg-neutral-800"
              />
            )}
            <div className="relative flex items-center ">
              {/*<span
              className={cn(
                "relative flex size-6 items-center justify-start rounded-md shadow-sm",
                model.iconClassName,
              )}
            >
              <ModelIcon className="size-3.5" strokeWidth={2} />
            </span>*/}

              <span className="relative flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {model.name}
                {isSelected && (
                  <Check
                    className="size-3 text-white  bg-sky-500 rounded-full p-[1px]"
                    strokeWidth={2.4}
                  />
                )}
              </span>
            </div>
            <span className="relative text-xs leading-none text-neutral-500 dark:text-neutral-400">
              {model.capability}
            </span>
          </motion.label>
        );
      })}
    </motion.div>
  );
}

export function AiChatBox({
  className,
  models = DEFAULT_MODELS,
  messages: controlledMessages,
  defaultMessages = [],
  onMessagesChange,
  value,
  defaultValue = "",
  onValueChange,
  selectedModelId: controlledSelectedModelId,
  defaultSelectedModelId,
  onSelectedModelChange,
  onSend,
  actions,
  labels: labelOverrides,
  renderMessage,
  emptyState,
  disabled = false,
  isSending = false,
  maxLength,
  submitOnEnter = true,
}: AiChatBoxProps) {
  const baseId = useId();
  const modelSelectorId = useId();
  const messageIdRef = useRef(1);
  const modelKeyboardToggleRef = useRef(false);
  const modelTriggerRef = useRef<HTMLButtonElement>(null);
  const previousMessageCountRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [internalMessages, setInternalMessages] = useState<AiChatMessage[]>(defaultMessages);
  const [internalInput, setInternalInput] = useState(defaultValue);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [internalSelectedModelId, setInternalSelectedModelId] = useState(
    defaultSelectedModelId ?? models[0]?.id ?? "",
  );
  const [modelMotionEnabled, setModelMotionEnabled] = useState(true);
  const [composerSurfaceId, setComposerSurfaceId] = useState<string | null>(
    () => `${baseId}-msg-1`,
  );
  const [departingMessage, setDepartingMessage] = useState<AiChatMessage | null>(null);
  const [morphingMessageId, setMorphingMessageId] = useState<string | null>(null);

  const messages = controlledMessages ?? internalMessages;
  const input = value ?? internalInput;
  const selectedModelId = controlledSelectedModelId ?? internalSelectedModelId;
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const hasMessages = messages.length > 0;
  const trimmedInput = input.trim();
  const canSend = trimmedInput.length > 0 && !disabled && !isSending;
  const selectedModel = models.find((model) => model.id === selectedModelId) ?? models[0];
  const modelPanelId = `${modelSelectorId}-options`;
  const composerActions: AiChatAction[] = actions ?? [
    {
      id: "attach",
      label: "Attach file",
      icon: <IconLinkFillDuo18 className="size-3.5" strokeWidth={1.75} />,
    },
    {
      id: "search",
      label: "Search web",
      icon: <IconEarthFillDuo18 className="size-3.5" strokeWidth={1.75} />,
    },
    {
      id: "more",
      label: "More options",
      icon: <MoreHorizontal className="size-3.5" strokeWidth={1.75} />,
    },
  ];

  const updateInput = useCallback(
    (nextValue: string) => {
      if (value === undefined) setInternalInput(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  const updateSelectedModel = useCallback(
    (modelId: string) => {
      if (controlledSelectedModelId === undefined) {
        setInternalSelectedModelId(modelId);
      }
      onSelectedModelChange?.(modelId);
    },
    [controlledSelectedModelId, onSelectedModelChange],
  );

  const updateMessages = useCallback(
    (nextMessages: AiChatMessage[]) => {
      if (controlledMessages === undefined) setInternalMessages(nextMessages);
      onMessagesChange?.(nextMessages);
    },
    [controlledMessages, onMessagesChange],
  );

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    shouldStickToBottomRef.current = true;
    el.scrollTop = el.scrollHeight;
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom <= 24;
  }, []);

  useLayoutEffect(() => {
    const messageCount = messages.length;

    if (messageCount !== previousMessageCountRef.current) {
      scrollToBottom();
      previousMessageCountRef.current = messageCount;
    }
  }, [messages.length, scrollToBottom]);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  const nextComposerMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return `${baseId}-msg-${messageIdRef.current}`;
  }, [baseId]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      scrollToBottom();

      const id = composerSurfaceId ?? nextComposerMessageId();
      const nextSurfaceId = nextComposerMessageId();

      setDepartingMessage({ id, text: trimmed });
      setMorphingMessageId(id);
      updateInput("");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const message = { id, text: trimmed };
          updateMessages([...messages, message]);
          void onSend?.(message, selectedModel);
          setDepartingMessage(null);
          setComposerSurfaceId(nextSurfaceId);
          requestAnimationFrame(() => {
            resizeTextarea();
          });
        });
      });
    },
    [
      composerSurfaceId,
      messages,
      nextComposerMessageId,
      onSend,
      resizeTextarea,
      scrollToBottom,
      selectedModel,
      updateInput,
      updateMessages,
    ],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  const handleSurfaceAnimationComplete = useCallback(() => {
    setMorphingMessageId(null);
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <MotionConfig reducedMotion="user" transition={sharedLayoutTransition}>
      <LayoutGroup id="ai-chat">
        <div
          className={cn(
            "flex h-full max-h-[500px] w-full max-w-[360px] flex-col overflow-hidden rounded-[2rem] bg-neutral-100 dark:bg-neutral-900",
            className,
          )}
        >
          <div
            ref={scrollRef}
            onScroll={handleMessagesScroll}
            className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 pt-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {!hasMessages && (
                <motion.div
                  key="empty"
                  className="flex flex-1 flex-col items-center justify-center px-2 py-6"
                >
                  <motion.h2
                    layout
                    className="text-center text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
                  >
                    {emptyState ?? labels.empty}
                  </motion.h2>
                </motion.div>
              )}
              </AnimatePresence>

              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    id={message.id}
                    text={message.text}
                    isMorphing={morphingMessageId === message.id}
                    onSurfaceAnimationComplete={handleSurfaceAnimationComplete}
                    renderMessage={renderMessage}
                  />
                ))}
              </AnimatePresence>
              </div>
            </div>

          <div className="shrink-0 px-3 pb-3">
            <form onSubmit={handleSubmit} className="relative bg-none">
              <motion.div
                layout
                transition={modelMotionEnabled ? sharedLayoutTransition : { duration: 0 }}
                className={cn("relative flex flex-col gap-3 overflow-hidden rounded-b-[1.75rem] p-3")}
              >
                <div className="absolute inset-0 rounded-b-[1.75rem] bg-white shadow-sm dark:bg-neutral-900 dark:shadow-neutral-950/50  " />
                <AnimatePresence initial={false}>
                  {departingMessage ? (
                    <MessageSurface
                      key={departingMessage.id}
                      id={departingMessage.id}
                      text={departingMessage.text}
                      isMorphing
                      className="pointer-events-none absolute inset-0 z-20 rounded-[1.75rem] px-4 py-3 dark:shadow-neutral-950/50"
                    />
                  ) : composerSurfaceId ? (
                    <motion.div
                      initial={false}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 1 }}
                      key={composerSurfaceId}
                      layoutId={getMessageSurfaceLayoutId(composerSurfaceId)}
                      transition={sharedLayoutTransition}
                      className="!opacity-100 absolute inset-0 rounded-[1.75rem] bg-white shadow-sm dark:bg-neutral-800 dark:shadow-neutral-950/50"
                    />
                  ) : null}
                </AnimatePresence>
                <motion.div layout="position" className="relative z-10">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      updateInput(e.target.value);
                      requestAnimationFrame(resizeTextarea);
                    }}
                    onFocus={() => setIsModelPickerOpen(false)}
                    onKeyDown={handleKeyDown}
                    placeholder={labels.input}
                    disabled={disabled || isSending}
                    maxLength={maxLength}
                    rows={1}
                    className="min-h-[1.5rem] w-full resize-none border-0 bg-transparent px-1 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                    aria-label={labels.inputAriaLabel}
                  />
                </motion.div>

                <AnimatePresence initial={false} mode="popLayout">
                  {isModelPickerOpen && models.length > 0 && (
                    <ModelPickerPanel
                      key="model-picker"
                      panelId={modelPanelId}
                      selectorId={modelSelectorId}
                      selectedModelId={selectedModelId}
                      models={models}
                      ariaLabel={labels.modelPicker}
                      motionEnabled={modelMotionEnabled}
                      onSelect={updateSelectedModel}
                      onClose={() => setIsModelPickerOpen(false)}
                      onKeyboardInteraction={() => setModelMotionEnabled(false)}
                      onReturnFocus={() => modelTriggerRef.current?.focus()}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  layout="position"
                  className="relative z-10 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1">
                    {selectedModel ? (
                      <button
                        ref={modelTriggerRef}
                        type="button"
                        aria-label={`Model: ${selectedModel?.name ?? "Unavailable"}`}
                        aria-haspopup="dialog"
                        aria-expanded={isModelPickerOpen}
                        aria-controls={modelPanelId}
                        onPointerDown={() => setModelMotionEnabled(true)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            modelKeyboardToggleRef.current = true;
                            setModelMotionEnabled(false);
                            setIsModelPickerOpen((isOpen) => !isOpen);
                            requestAnimationFrame(() => {
                              modelKeyboardToggleRef.current = false;
                            });
                          } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                            event.preventDefault();
                            setModelMotionEnabled(false);
                            setIsModelPickerOpen(true);
                          } else if (event.key === "Escape") {
                            event.preventDefault();
                            setModelMotionEnabled(false);
                            setIsModelPickerOpen(false);
                          }
                        }}
                        onClick={() => {
                          if (modelKeyboardToggleRef.current) return;
                          setIsModelPickerOpen((isOpen) => !isOpen);
                        }}
                        className={cn(
                          "flex h-8 min-w-[96px] items-center gap-1.5 rounded-lg bg-neutral-100 px-2 text-left text-xs font-medium text-neutral-700 outline-none transition-[color,background-color,transform] duration-150 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
                          modelMotionEnabled && "active:scale-[0.97]",
                        )}
                      >
                        <span className="relative h-4 min-w-0 flex-1 overflow-hidden">
                          <AnimatePresence initial={false} mode="popLayout">
                            <motion.span
                              key={selectedModel.id}
                              initial={
                                modelMotionEnabled
                                  ? {
                                      opacity: 0,
                                      transform: "translateY(6px)",
                                    }
                                  : false
                              }
                              animate={{
                                opacity: 1,
                                transform: "translateY(0px)",
                              }}
                              exit={
                                modelMotionEnabled
                                  ? {
                                      opacity: 0,
                                      transform: "translateY(-6px)",
                                    }
                                  : { opacity: 0 }
                              }
                              transition={{
                                duration: modelMotionEnabled ? 0.16 : 0,
                                ease: easeOut,
                              }}
                              className="absolute inset-0 flex items-center"
                            >
                              {selectedModel.name}
                            </motion.span>
                          </AnimatePresence>
                        </span>

                        <motion.span
                          aria-hidden="true"
                          animate={{
                            transform: isModelPickerOpen ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                          transition={{
                            duration: modelMotionEnabled ? 0.16 : 0,
                            ease: easeOut,
                          }}
                          className="flex shrink-0 text-neutral-400"
                        >
                          <ChevronDown className="size-3" strokeWidth={1.8} />
                        </motion.span>
                      </button>
                    ) : null}

                    {composerActions.map((action) => (
                      <ComposerIconButton
                        key={action.id}
                        label={action.label}
                        onClick={action.onClick}
                        disabled={disabled || isSending || action.disabled}
                      >
                        {action.icon}
                      </ComposerIconButton>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={!canSend}
                    aria-label={labels.send}
                    onFocus={() => setIsModelPickerOpen(false)}
                    onPointerDown={() => setIsModelPickerOpen(false)}
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl transition-[color,background-color,transform] duration-150 active:scale-[0.97]",
                      canSend
                        ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                        : "cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600",
                    )}
                  >
                    <ArrowUp className="size-4" strokeWidth={2.25} />
                  </button>
                </motion.div>
              </motion.div>
            </form>
          </div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

export default AiChatBox;

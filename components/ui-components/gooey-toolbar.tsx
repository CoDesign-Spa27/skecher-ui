'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconShapesFillDuo18, IconTrashFillDuo18, IconPenNib3FillDuo18, IconClipboardFillDuo18, IconBellFillDuo18, IconGamepadButtonsFillDuo18, IconShopFillDuo18, IconImages2FillDuo18, IconFacialRecognitionFillDuo18, IconAlarmClockFillDuo18 } from 'nucleo-ui-essential-fill-duo-18';
 
import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type GooeyToolbarVariant = 'peel' | 'amoeba'

type GooeyItem = {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
}

type GooeyToolbarProps = {
    variant?: GooeyToolbarVariant
    defaultVariant?: GooeyToolbarVariant
    showVariantToggle?: boolean
    className?: string
}

const filterId = 'gooey-toolbar-filter'

const spring = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 34,
    mass: 0.8,
}

const gooStyle = {
    filter: `url(#${filterId})`,
} satisfies CSSProperties

const blobClass =
    'rounded-full bg-foreground text-background shadow-[0_12px_30px_-18px_rgb(0_0_0/0.7)] transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const peelActions: GooeyItem[] = [
    { id: 'edit', label: 'Edit', icon: IconPenNib3FillDuo18 },
    { id: 'copy', label: 'Copy', icon: IconClipboardFillDuo18 },
    { id: 'share', label: 'Share', icon: IconBellFillDuo18 },
    { id: 'delete', label: 'Delete', icon: IconTrashFillDuo18 },
]

const amoebaTools: GooeyItem[] = [
    { id: 'shop', label: 'Shop', icon: IconShopFillDuo18 },
    { id: 'images', label: 'Images', icon: IconImages2FillDuo18 },
    { id: 'face', label: 'Face', icon: IconFacialRecognitionFillDuo18 },
    { id: 'clock', label: 'Clock', icon: IconAlarmClockFillDuo18 },
]

function getArcPoint(
    index: number,
    total: number,
    radius: number,
    startAngle: number,
    endAngle: number
) {
    const angle =
        total === 1
            ? (startAngle + endAngle) / 2
            : startAngle + ((endAngle - startAngle) / (total - 1)) * index
    const radians = (angle * Math.PI) / 180

    return {
        x: Math.cos(radians) * radius,
        y: Math.sin(radians) * radius,
    }
}

// Simple minimalist toggle group instead of library toggle group
function VariantToggle({
    value,
    onValueChange,
}: {
    value: GooeyToolbarVariant
    onValueChange: (value: GooeyToolbarVariant) => void
}) {
    return (
        <div
            role="radiogroup"
            aria-label="Select gooey toolbar variant"
            className="inline-flex rounded-lg border bg-background p-0.5 gap-0.5 shadow-xs"
        >
            <button
                type="button"
                role="radio"
                aria-checked={value === 'peel'}
                aria-label="Use peel toolbar"
                className={cn(
                    "h-7 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    value === 'peel'
                        ? "bg-accent text-foreground"
                        : "bg-transparent text-foreground/60 hover:bg-foreground/10"
                )}
                onClick={() => onValueChange('peel')}
                tabIndex={0}
            >
                Peel
            </button>
            <button
                type="button"
                role="radio"
                aria-checked={value === 'amoeba'}
                aria-label="Use amoeba toolbar"
                className={cn(
                    "h-7 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    value === 'amoeba'
                        ? "bg-accent text-foreground"
                        : "bg-transparent text-foreground/60 hover:bg-foreground/10"
                )}
                onClick={() => onValueChange('amoeba')}
                tabIndex={0}
            >
                Amoeba
            </button>
        </div>
    )
}

function PeelToolbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)

    return (
        <div className="relative h-48 w-72">
            <div className="absolute inset-0" style={gooStyle}>
                <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
                    <motion.button
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Close peel toolbar' : 'Open peel toolbar'}
                        animate={{ scale: 1 }}
                        className={cn(blobClass, 'flex size-12 items-center justify-center')}
                        onClick={() => {
                            setIsOpen((current) => !current)
                            if (isOpen) setActiveId(null)
                        }}
                        transition={spring}
                        type="button"
                    >
                        <motion.span
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            className="font-satoshi text-xs font-semibold tracking-tight"
                            transition={{
                                type: 'spring',
                                bounce: 0.15,
                                duration: 0.3,
                            }}
                        >
                            <IconShapesFillDuo18 className="size-6" />
                        </motion.span>
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isOpen ? (
                        <motion.div
                            animate={{ x: 0, y: '-50%', opacity: 1 }}
                            className="absolute right-16 top-1/2 flex flex-row-reverse items-center"
                            exit={{ x: 18, y: '-50%', opacity: 0 }}
                            initial={{ x: 18, y: '-50%', opacity: 0 }}
                            transition={spring}
                        >
                            {peelActions.map((action, index) => {
                                const Icon = action.icon
                                const isActive = activeId === action.id

                                return (
                                    <motion.button
                                        aria-label={action.label}
                                        aria-pressed={isActive}
                                        animate={{
                                            x: 0,
                                            scale: isActive ? 1.06 : 1,
                                            opacity: 1,
                                        }}
                                        className={cn(
                                            blobClass,
                                            'flex size-11 items-center justify-center'
                                        )}
                                        exit={{ x: 12, scale: 0.4, opacity: 0 }}
                                        initial={{ x: 12, scale: 0.4, opacity: 0 }}
                                        key={action.id}
                                        onClick={() =>
                                            setActiveId((current) =>
                                                current === action.id ? null : action.id
                                            )
                                        }
                                        transition={{
                                            ...spring,
                                            delay: index * 0.025,
                                        }}
                                        type="button"
                                    >
                                        <Icon className="size-4" />
                                    </motion.button>
                                )
                            })}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    )
}

function AmoebaToolbar() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
                setActiveId(null)
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [])

    return (
        <div ref={containerRef} className="relative flex h-52 w-full items-center justify-center">
            <div className="relative flex size-44 items-center justify-center" style={gooStyle}>
                <motion.button
                    aria-expanded={isOpen}
                    aria-label={isOpen ? 'Close amoeba toolbar' : 'Open amoeba toolbar'}
                    animate={{ scale: isOpen ? 0.82 : 1 }}
                    className={cn(
                        blobClass,
                        'relative z-10 flex size-14 items-center justify-center'
                    )}
                    onClick={() => {
                        if (isOpen) {
                            setIsOpen(false)
                            setActiveId(null)
                            return
                        }

                        setIsOpen(true)
                    }}
                    transition={spring}
                    type="button"
                >
                    <IconGamepadButtonsFillDuo18
                        className="size-6"
                    />
                </motion.button>

                <AnimatePresence>
                    {isOpen
                        ? amoebaTools.map((tool, index) => {
                            const point = getArcPoint(index, amoebaTools.length, 72, 210, -30)
                            const Icon = tool.icon
                            const isActive = activeId === tool.id

                            return (
                                <motion.button
                                    aria-label={tool.label}
                                    aria-pressed={isActive}
                                    animate={{
                                        x: point.x,
                                        y: point.y,
                                        scale: isActive ? 1.12 : 1,
                                        opacity: 1,
                                    }}
                                    className={cn(
                                        blobClass,
                                        'absolute flex size-11 items-center justify-center'
                                    )}
                                    exit={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                                    initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                                    key={tool.id}
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        setActiveId((current) =>
                                            current === tool.id ? null : tool.id
                                        )
                                    }}
                                    transition={{
                                        ...spring,
                                        delay: index * 0.04,
                                    }}
                                    type="button"
                                >
                                    <Icon className="size-4" />
                                </motion.button>
                            )
                        })
                        : null}
                </AnimatePresence>
            </div>
        </div>
    )
}

export function GooeyFilter() {
    return (
        <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
            <defs>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="6" />
                    <feColorMatrix
                        in="blur"
                        result="goo"
                        type="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -16"
                    />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
            </defs>
        </svg>
    )
}

export function GooeyToolbar({
    className,
    defaultVariant = 'peel',
    showVariantToggle = true,
    variant,
}: GooeyToolbarProps) {
    const [selectedVariant, setSelectedVariant] = useState<GooeyToolbarVariant>(defaultVariant)
    const currentVariant = variant ?? selectedVariant

    return (
        <div className={cn('relative w-full items-center justify-center flex h-full', className)}>
            <GooeyFilter />
            {showVariantToggle ? (
                <div className="absolute top-0 right-0 mb-4 flex justify-center">
                    <VariantToggle value={currentVariant} onValueChange={setSelectedVariant} />
                </div>
            ) : null}

            <AnimatePresence mode="wait">
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    initial={{ opacity: 0, y: 8 }}
                    key={currentVariant}
                    transition={{ duration: 0.18 }}
                >
                    {currentVariant === 'peel' ? <PeelToolbar /> : <AmoebaToolbar />}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export const PeelTab = PeelToolbar
export const AmoebaFab = AmoebaToolbar

export default GooeyToolbar

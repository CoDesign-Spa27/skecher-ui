'use client'

import type { CSSProperties, ElementType } from 'react'
import { useEffect, useId, useMemo, useState } from 'react'
import {
    AnimatePresence,
    LayoutGroup,
    motion,
    type Transition,
    type Variants,
} from 'motion/react'

import { cn } from '@/lib/utils'

interface MorphingTextProps {
    texts: string[]
    className?: string
    interval?: number
}

type TextMorphProps = {
    children: string
    as?: ElementType
    className?: string
    style?: CSSProperties
    variants?: Variants
    transition?: Transition
    layoutTransition?: Transition
}

const defaultVariants: Variants = {
    initial: {
        opacity: 0,
        filter: 'blur(0px)',
        y: 6,
    },
    animate: {
        opacity: 1,
        filter: 'blur(10px)',
        y: 0,
    },
    exit: {
        opacity: 0,
        filter: 'blur(0px)',
        y: -6,
    },
}

const defaultPresenceTransition: Transition = {
    duration: 0.22,
    ease: 'easeOut',
}

const defaultLayoutTransition: Transition = {
    type: 'spring',
    bounce: 0.12,
}

const getCharacterTokens = (text: string, uniqueId: string) => {
    const characterCounts = new Map<string, number>()

    return Array.from(text).map((character) => {
        const normalizedCharacter = character.toLowerCase()
        const occurrence = (characterCounts.get(normalizedCharacter) ?? 0) + 1
        characterCounts.set(normalizedCharacter, occurrence)

        return {
            id: `${uniqueId}-${normalizedCharacter}-${occurrence}`,
            displayCharacter: character === ' ' ? '\u00A0' : character,
        }
    })
}

export const TextMorph = ({
    children,
    as: Component = 'span',
    className,
    style,
    variants = defaultVariants,
    transition = defaultPresenceTransition,
    layoutTransition = defaultLayoutTransition,
}: TextMorphProps) => {
    const uniqueId = useId()
    const characters = useMemo(
        () => getCharacterTokens(children, uniqueId),
        [children, uniqueId]
    )
    const animate = variants === defaultVariants
        ? {
            opacity: 1,
            filter: ['blur(10px)', 'blur(10px)', 'blur(0px)'],
            y: 0,
        }
        : 'animate'

    return (
        <Component
            aria-label={children}
            className={cn(
                'relative isolate overflow-hidden whitespace-pre leading-none',
                className
            )}
            style={style}
        >
            <LayoutGroup id={uniqueId}>
                <AnimatePresence initial={false} mode="popLayout">
                    {characters.map((character) => (
                        <motion.span
                            aria-hidden="true"
                            className="inline-block"
                            initial="initial"
                            animate={animate}
                            exit="exit"
                            key={character.id}
                            layout
                            layoutId={character.id}
                            variants={variants}
                            transition={{
                                ...transition,
                                filter: {
                                    duration: 0.22,
                                    ease: 'easeOut',
                                },
                                opacity: {
                                    duration: 0.22,
                                    ease: 'easeOut',
                                },
                                y: {
                                    duration: 0.22,
                                    ease: 'easeOut',
                                },
                                layout: layoutTransition,
                            }}
                        >
                            {character.displayCharacter}
                        </motion.span>
                    ))}
                </AnimatePresence>
            </LayoutGroup>
        </Component>
    )
}

export const MorphingText = ({
    texts,
    className,
    interval = 2000,
}: MorphingTextProps) => {
    const [index, setIndex] = useState(0)
    const currentText = texts[index % texts.length] ?? ''

    useEffect(() => {
        if (texts.length < 2) return

        const timer = window.setInterval(() => {
            setIndex((currentIndex) => (currentIndex + 1) % texts.length)
        }, interval)

        return () => window.clearInterval(timer)
    }, [interval, texts.length])

    if (texts.length === 0) {
        return null
    }

    return (

        <TextMorph
            className={cn(
                'inline-flex min-h-[1em] items-center justify-center xl:text-4xl md:text-3xl text-lg ',
                className
            )}
        >
            {currentText}
        </TextMorph>

    )
}

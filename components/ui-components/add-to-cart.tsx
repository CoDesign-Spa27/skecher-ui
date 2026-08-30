"use client";

import NumberFlow from "@number-flow/react";
import { arc, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type AddToCartItem = {
  id: number;
  image: string;
  price: number;
  alt: string;
};

export type AddToCartImage =
  | string
  | {
      src: string;
      alt?: string;
    };

export type AddToCartLayout = {
  columns?: 2 | 3 | 4;
  gap?: "compact" | "default" | "roomy";
  showBorder?: boolean;
  stackLimit?: number;
  stackSpread?: number;
};

export type AddToCartMotion = {
  duration?: number;
  peak?: number;
  strength?: number;
  tapScale?: number;
};

type Flight = {
  id: number;
  item: AddToCartItem;

  // Starting position
  left: number;
  top: number;

  // Distance to cart
  x: number;
  y: number;

  width: number;
  height: number;
};

type ProductTileProps = {
  item: AddToCartItem;
  added: boolean;
  disabled: boolean;
  priceLabel: string;
  imageSizes: string;
  tapScale: number;
  shouldReduceMotion: boolean;
  onAdd: (item: AddToCartItem, source: DOMRect) => void;
};

export type AddToCartProps = {
  cartIcon?: ReactNode;
  cartLabel?: string;
  className?: string;
  currency?: string;
  disabled?: boolean;
  imageSizes?: string;
  images?: readonly AddToCartImage[];
  initialItems?: readonly number[];
  items?: readonly AddToCartItem[];
  layout?: AddToCartLayout;
  locale?: string | string[];
  motion?: AddToCartMotion;
  onCartChange?: (items: readonly AddToCartItem[], total: number) => void;
  onItemAdd?: (item: AddToCartItem) => void;
};

export const ADD_TO_CART_ITEMS = [
  {
    id: 1,
    image: "/images/add-to-cart/image1.png",
    price: 150,
    alt: "Pink and blue marbled artwork",
  },
  {
    id: 2,
    image: "/images/add-to-cart/image2.png",
    price: 360,
    alt: "Pastel orbital artwork",
  },
  {
    id: 3,
    image: "/images/add-to-cart/image3.png",
    price: 100,
    alt: "Blue ink cloud artwork",
  },
  {
    id: 4,
    image: "/images/add-to-cart/image4.png",
    price: 432,
    alt: "Turquoise and yellow flowing artwork",
  },
  {
    id: 5,
    image: "/images/add-to-cart/image5.png",
    price: 460,
    alt: "Mountain landscape at night",
  },
  {
    id: 6,
    image: "/images/add-to-cart/image6.png",
    price: 970,
    alt: "Blue and white painted artwork",
  },
  {
    id: 7,
    image: "/images/add-to-cart/image7.png",
    price: 720,
    alt: "Purple and cyan wave artwork",
  },
  {
    id: 8,
    image: "/images/add-to-cart/image8.png",
    price: 633,
    alt: "Pink and blue light artwork",
  },
] as const satisfies readonly AddToCartItem[];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const EMPTY_IMAGES: readonly AddToCartImage[] = [];
const EMPTY_INITIAL_ITEMS: readonly number[] = [];

const COLUMN_CLASSES = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
} as const;

const GAP_CLASSES = {
  compact: "gap-2",
  default: "gap-3 sm:gap-4",
  roomy: "gap-4 sm:gap-6",
} as const;

const tileVariants = {
  idle: {
    filter: "blur(0px)",
    opacity: 1,
    scale: 1,
  },

  hover: {
    filter: "blur(3px)",
    opacity: 0.48,
    scale: 1.025,
  },

  added: {
    filter: "blur(1.5px)",
    opacity: 0.58,
    scale: 1,
  },
};

const affordanceVariants = {
  idle: {
    opacity: 0,
    scale: 0.94,
  },

  hover: {
    opacity: 1,
    scale: 1,
  },

  added: {
    opacity: 1,
    scale: 1,
  },
};

function ProductTile({
  item,
  added,
  disabled,
  priceLabel,
  imageSizes,
  tapScale,
  shouldReduceMotion,
  onAdd,
}: ProductTileProps) {
  return (
    <motion.button
      type="button"
      initial={false}
      disabled={added || disabled}
      animate={added ? "added" : "idle"}
      whileHover={added || disabled ? undefined : "hover"}
      whileFocus={added || disabled ? undefined : "hover"}
      whileTap={added || disabled || shouldReduceMotion ? undefined : { scale: tapScale }}
      onClick={(event) => {
        onAdd(item, event.currentTarget.getBoundingClientRect());
      }}
      aria-label={added ? `${item.alt} added to cart` : `Add ${item.alt} for ${priceLabel}`}
      className="
        group relative aspect-square min-w-0
        overflow-hidden rounded-lg bg-neutral-300/20
        outline-none ring-offset-2 ring-offset-neutral-950
        focus-visible:ring-2 focus-visible:ring-white/80
        disabled:cursor-default
      "
    >
      <motion.div
        className="absolute inset-0"
        variants={tileVariants}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.18,
          ease: EASE_OUT,
        }}
      >
        <Image
          fill
          draggable={false}
          src={item.image}
          alt={item.alt}
          sizes={imageSizes}
          className="object-cover"
        />
      </motion.div>

      <motion.span
        aria-hidden="true"
        variants={affordanceVariants}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.18,
          ease: EASE_OUT,
        }}
        className="
          absolute inset-0
          flex items-center justify-center
          bg-neutral-100/10
          [@media(hover:none)]:opacity-100
        "
      >
        <span
          className="
            flex size-7 items-center justify-center
            rounded-full bg-white text-neutral-950
            shadow-[0_4px_8px_rgb(0_0_0/0.18)]
          "
        >
          {added ? <CheckIcon className="size-5" /> : <PlusIcon className="size-5" />}
        </span>
      </motion.span>
    </motion.button>
  );
}

type ArcPath = ReturnType<typeof arc>;

function FlyingProduct({
  flight,
  duration,
  path,
  onComplete,
}: {
  flight: Flight;
  duration: number;
  path: ArcPath;
  onComplete: () => void;
}) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: flight.x,
        y: flight.y,

        scale: [1, 0.78, 0.18],
        opacity: [1, 1, 0.72],
      }}
      transition={{
        duration,
        ease: EASE_IN_OUT,

        // Motion handles the curved trajectory.
        path,

        scale: {
          duration,
          ease: EASE_IN_OUT,
          times: [0, 0.55, 1],
        },

        opacity: {
          duration,
          ease: EASE_IN_OUT,
          times: [0, 0.78, 1],
        },
      }}
      onAnimationComplete={onComplete}
      style={{
        left: flight.left,
        top: flight.top,
        width: flight.width,
        height: flight.height,
      }}
      className="
        pointer-events-none fixed z-[70]
        overflow-hidden rounded-xl
        shadow-[0_6px_12px_rgb(0_0_0/0.24)]
      "
    >
      <Image
        fill
        alt=""
        src={flight.item.image}
        sizes={`${Math.round(flight.width)}px`}
        className="object-cover"
      />
    </motion.div>
  );
}

const STACK_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 28,
  mass: 0.75,
} as const;

function getStackPosition(index: number, count: number, expanded: boolean, spread: number) {
  const center = (count - 1) / 2;
  const offset = index - center;

  if (!expanded) {
    return {
      x: offset * 3,
      y: 4 + Math.abs(offset) * 4,
      rotate: offset * 7,
    };
  }
  const maxDistance = Math.max(center, 1);
  const distanceFromCenter = Math.abs(offset) / maxDistance;

  return {
    x: offset * spread,
    y: -spread * 0.8 - (1 - distanceFromCenter) * spread,

    rotate: offset * 12,
  };
}

function CartStack({
  cart,
  icon,
  limit,
  spread,
  shouldReduceMotion,
}: {
  cart: AddToCartItem[];
  icon: ReactNode;
  limit: number;
  spread: number;
  shouldReduceMotion: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const items = cart.slice(-limit);

  return (
    <motion.div
      className="relative flex size-14 shrink-0 items-center justify-center"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[18px]
          z-0
          size-0
        "
      >
        {items.map((item, index) => {
          const position = getStackPosition(index, items.length, hovered, spread);

          return (
            <motion.div
              key={item.id}
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 0,
                    }
              }
              animate={{
                opacity: 1,
                x: position.x,
                y: position.y,
                rotate: position.rotate,
              }}
              transition={shouldReduceMotion ? { duration: 0 } : STACK_SPRING}
              style={{
                zIndex: index,
              }}
              className="
                absolute
                -left-[8px]
                -top-[18px]
                size-5
                overflow-hidden
                rounded-[4px]
                border
                border-background
                shadow-sm
                will-change-transform
              "
            >
              <Image fill alt="" src={item.image} sizes="36px" className="object-cover" />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 flex size-12 items-center justify-center">{icon}</div>
    </motion.div>
  );
}

export function AddToCart({
  cartIcon = <CartIcon className="size-full" />,
  cartLabel = "Cart total",
  className,
  currency = "USD",
  disabled = false,
  imageSizes = "(min-width: 640px) 5rem, 40vw",
  images = EMPTY_IMAGES,
  initialItems = EMPTY_INITIAL_ITEMS,
  items = ADD_TO_CART_ITEMS,
  layout,
  locale = "en-US",
  motion: motionOptions,
  onCartChange,
  onItemAdd,
}: AddToCartProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  const columns = layout?.columns ?? 4;
  const gap = layout?.gap ?? "default";
  const showBorder = layout?.showBorder ?? true;
  const stackLimit = Math.max(1, Math.round(layout?.stackLimit ?? 5));
  const stackSpread = Math.max(0, layout?.stackSpread ?? 20);
  const flightDuration = Math.max(0, motionOptions?.duration ?? 0.58);
  const flightPeak = motionOptions?.peak ?? 0.42;
  const flightStrength = motionOptions?.strength ?? 0.32;
  const tapScale = motionOptions?.tapScale ?? 0.96;

  const catalog = useMemo(
    () =>
      items.map((item, index) => {
        const image = images[index];

        if (!image) return item;

        return {
          ...item,
          image: typeof image === "string" ? image : image.src,
          alt: typeof image === "string" ? item.alt : (image.alt ?? item.alt),
        };
      }),
    [images, items],
  );

  const cartTargetRef = useRef<HTMLDivElement>(null);
  const nextFlightIdRef = useRef(0);

  const [cartIds, setCartIds] = useState<number[]>(() => [...new Set(initialItems)]);
  const cartIdsRef = useRef(cartIds);

  const [flights, setFlights] = useState<Flight[]>([]);

  const catalogById = useMemo(() => new Map(catalog.map((item) => [item.id, item])), [catalog]);

  const cart = useMemo(
    () =>
      cartIds.flatMap((id) => {
        const item = catalogById.get(id);
        return item ? [item] : [];
      }),
    [cartIds, catalogById],
  );

  /*
   * Reusing the same arc instance is recommended
   * when Motion chooses the direction automatically.
   *
   * strength -> how curved the path is
   * peak     -> where the curve reaches its highest point
   */
  const flightPath = useMemo(
    () =>
      arc({
        strength: flightStrength,
        peak: flightPeak,
      }),
    [flightPeak, flightStrength],
  );

  const selectedIds = useMemo(() => {
    return new Set([...cartIds, ...flights.map((flight) => flight.item.id)]);
  }, [cartIds, flights]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  }, [cart]);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: 0,
      }),
    [currency, locale],
  );

  const commitItem = useCallback(
    (item: AddToCartItem) => {
      if (cartIdsRef.current.includes(item.id)) return;

      const nextIds = [...cartIdsRef.current, item.id];
      const nextItems = nextIds.flatMap((id) => {
        const catalogItem = catalogById.get(id);
        return catalogItem ? [catalogItem] : [];
      });

      cartIdsRef.current = nextIds;
      setCartIds(nextIds);
      onItemAdd?.(item);
      onCartChange?.(
        nextItems,
        nextItems.reduce((sum, nextItem) => sum + nextItem.price, 0),
      );
    },
    [catalogById, onCartChange, onItemAdd],
  );

  const addToCart = (item: AddToCartItem, source: DOMRect) => {
    if (disabled || selectedIds.has(item.id)) return;

    const target = cartTargetRef.current?.getBoundingClientRect();

    /*
     * Accessibility:
     * Don't animate the flight when the user
     * prefers reduced motion.
     */
    if (shouldReduceMotion || !target) {
      commitItem(item);
      return;
    }

    const startX = source.left + source.width / 2;

    const startY = source.top + source.height / 2;

    const endX = target.left + target.width / 2;

    const endY = target.top + target.height / 2;

    nextFlightIdRef.current += 1;

    setFlights((current) => [
      ...current,
      {
        id: nextFlightIdRef.current,
        item,

        left: source.left,
        top: source.top,

        /*
         * We only give Motion the destination.
         * arc() generates the curved path.
         */
        x: endX - startX,
        y: endY - startY,

        width: source.width,
        height: source.height,
      },
    ]);
  };

  const finishFlight = (flight: Flight) => {
    setFlights((current) => current.filter((candidate) => candidate.id !== flight.id));

    commitItem(flight.item);
  };

  return (
    <div
      className={cn(
        `
          w-full max-w-[26rem]
          rounded-3xl
          p-5 text-foreground
        `,
        showBorder && "border",
        className,
      )}
    >
      <div className={cn("grid", COLUMN_CLASSES[columns], GAP_CLASSES[gap])}>
        {catalog.map((item) => (
          <ProductTile
            key={item.id}
            item={item}
            added={selectedIds.has(item.id)}
            disabled={disabled}
            imageSizes={imageSizes}
            priceLabel={priceFormatter.format(item.price)}
            shouldReduceMotion={shouldReduceMotion}
            tapScale={tapScale}
            onAdd={addToCart}
          />
        ))}
      </div>

      <div
        className="
          mt-4 flex min-h-20
          items-center justify-between gap-5
        "
      >
        <div className="flex min-w-0 items-center gap-4">
          <div ref={cartTargetRef} className="relative">
            <CartStack
              cart={cart}
              icon={cartIcon}
              limit={stackLimit}
              shouldReduceMotion={shouldReduceMotion}
              spread={stackSpread}
            />
          </div>
        </div>

        <div className="min-w-0 text-right">
          <span aria-live="polite" className="sr-only">
            {cart.length} items in cart. Total {total} {currency}.
          </span>

          <p className="text-xs font-medium text-muted-foreground">{cartLabel}</p>

          <NumberFlow
            value={total}
            locales={locale}
            aria-label={`${cartLabel} ${total}`}
            format={{
              style: "currency",
              currency,
              currencyDisplay: "narrowSymbol",
              minimumFractionDigits: 2,
            }}
            className="
              mt-1 block
              text-2xl font-medium
              tracking-[-0.025em]
              tabular-nums
              sm:text-3xl
            "
          />
        </div>
      </div>

      {flights.length > 0
        ? createPortal(
            flights.map((flight) => (
              <FlyingProduct
                key={flight.id}
                duration={flightDuration}
                flight={flight}
                path={flightPath}
                onComplete={() => finishFlight(flight)}
              />
            )),
            document.body,
          )
        : null}
    </div>
  );
}

export function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      x="0px"
      y="0px"
      width="12px"
      height="12px"
      viewBox="0 0 18 18"
    >
      <path
        d="M1.75 1.75L3.10101 2.088C3.49401 2.186 3.78899 2.51199 3.84799 2.91299L4.92731 10.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M15.25 13.25H4.75C3.9216 13.25 3.25 12.5784 3.25 11.75C3.25 10.9216 3.9216 10.25 4.75 10.25H13.0496C13.4701 10.25 13.8457 9.98691 13.9894 9.59171L15.2618 6.09171C15.4989 5.43951 15.0159 4.75 14.322 4.75H4.11801"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
      <path
        d="M4 17C4.552 17 5 16.552 5 16C5 15.448 4.552 15 4 15C3.448 15 3 15.448 3 16C3 16.552 3.448 17 4 17Z"
        fill="currentColor"
        data-color="color-2"
      ></path>
      <path
        d="M14 17C14.552 17 15 16.552 15 16C15 15.448 14.552 15 14 15C13.448 15 13 15.448 13 16C13 16.552 13.448 17 14 17Z"
        fill="currentColor"
        data-color="color-2"
      ></path>
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12.5L9.25 16.5L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

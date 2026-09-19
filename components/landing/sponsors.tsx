"use client";

import { motion } from "motion/react";
import Image from "next/image";

import { cn } from "@/lib/utils";

import { IN_VIEW, useReveal } from "./reveal";

type Sponsor = {
  href?: string;
  mark: string;
  name: string;
  logoSrc?: string;
  role?: string;
  size: "standard" | "wide";
};

export const SPONSORS: Sponsor[] = [
  {
    logoSrc: "/sponsers/tracwell/tracwell-icon-light.svg",
    mark: "01",
    name: "Tracwell",
    role: "Analytics sponsor",
    size: "wide",
  },
  { mark: "02", name: "Your brand", size: "standard" },
  { mark: "03", name: "Your brand", size: "standard" },
  { mark: "04", name: "Your brand", size: "standard" },
  { mark: "05", name: "Your brand", size: "wide" },
  { mark: "06", name: "Your brand", size: "standard" },
];

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const content = (
    <>
      {sponsor.logoSrc ? (
        <Image alt="" className="size-20" height={48} src={sponsor.logoSrc} width={48} />
      ) : (
        <span
          aria-hidden="true"
          className="font-urbanist text-[11px] font-medium tracking-[0.18em] text-white/30"
        >
          {sponsor.mark}
        </span>
      )}
      <span className="flex flex-col gap-1">
        <span className="font-urbanist text-lg font-medium tracking-[-0.02em] text-white/75 transition-colors duration-200 group-hover:text-white sm:text-xl">
          {sponsor.name}
        </span>
        {sponsor.role ? (
          <span className="font-urbanist text-xs text-white/45">{sponsor.role}</span>
        ) : null}
      </span>
    </>
  );

  const className = cn(
    "group flex min-h-48 flex-col justify-between rounded-[14px] border bg-white/[0.025] p-5",
    sponsor.logoSrc ? "border-solid border-white/10" : "border-dashed border-white/20",
    "transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
    "hover:border-white/40 hover:bg-white/[0.045] active:scale-[0.99]",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/35",
    "motion-reduce:transform-none motion-reduce:transition-none sm:min-h-60 sm:p-6",
  );

  if (sponsor.href) {
    return (
      <a className={className} href={sponsor.href} rel="noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export function Sponsors() {
  const { item, sequence } = useReveal({ blur: false, stagger: 0.05 });

  return (
    <section
      aria-labelledby="sponsors-title"
      className="relative bg-black px-[clamp(12px,1.48vw,19px)] py-[clamp(72px,10vh,128px)] text-white"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <motion.div variants={sequence} {...IN_VIEW}>
          <motion.div className="max-w-2xl" variants={item}>
            <h2
              className="text-balance font-instrument-serif text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.02] font-normal tracking-[-0.02em]"
              id="sponsors-title"
            >
              Backed by people who care about the details.
            </h2>
          </motion.div>

          <motion.div
            className="mt-[clamp(28px,4vw,24px)] grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
            variants={sequence}
          >
            {SPONSORS.map((sponsor, index) => (
              <motion.div
                className={cn(
                  sponsor.size === "wide" ? "col-span-2" : "col-span-1",
                  index === 3 && "sm:col-start-1",
                )}
                key={`${sponsor.name}-${sponsor.mark}`}
                variants={item}
              >
                <SponsorCard sponsor={sponsor} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

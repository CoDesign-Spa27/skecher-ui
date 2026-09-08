"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

import { FooterContourShader } from "./assets/footer-contour-shader";
import { FooterWordmark } from "./footer-wordmark";
import { IN_VIEW, useReveal } from "./reveal";

const GITHUB_URL = "https://github.com/CoDesign-Spa27/skecher-ui";

const LINK_GROUPS = [
  {
    links: [
      { href: "/docs", label: "Components" },
      { external: true, href: GITHUB_URL, label: "GitHub" },
    ],
    title: "Library",
  },
] as const;

const quietLink = cn(
  "rounded-sm text-white/45 outline-none transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "hover:text-white focus-visible:ring-[3px] focus-visible:ring-white/35",
);

export function Footer() {
  const { item, sequence } = useReveal();

  return (
    <footer className="relative bg-black px-[clamp(12px,1.48vw,19px)] pb-[clamp(16px,2.625vh,21px)] text-white">
      <div
        className={cn(
          "relative isolate flex min-h-[clamp(420px,58vh,600px)] flex-col overflow-hidden",
          "rounded-[clamp(18px,2.03vw,26px)] bg-[#111111]",
          "shadow-[inset_0_0.5px_0_rgb(255_255_255/18%),0_-0.5px_0.5px_0.5px_rgb(255_255_255/25%)]",
        )}
      >
        <FooterContourShader className="absolute inset-0 -z-10" />

        <motion.div
          className="flex flex-col gap-10 px-6 pt-6 sm:flex-row sm:justify-between"
          variants={sequence}
          {...IN_VIEW}
        >
          <motion.div className="max-w-[30ch]" variants={item}>
            <Logo markClassName="size-9" wordmarkClassName="text-3xl text-white" />
            <p className="mt-3 text-pretty font-urbanist text-[13.5px] leading-relaxed text-white/45">
              An open-source registry of React components you install with the shadcn CLI and own
              outright.
            </p>
          </motion.div>

          <div className="flex gap-[clamp(32px,6vw,84px)]">
            {LINK_GROUPS.map((group) => (
              <motion.div key={group.title} variants={item}>
                <ul className="mt-3.5 space-y-2.5 flex gap-5 text-base">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {"external" in link ? (
                        <a
                          className={cn(quietLink, "font-urbanist")}
                          href={link.href}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link className={cn(quietLink, "font-urbanist")} href={link.href}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="flex-1" />

        <FooterWordmark />
      </div>
    </footer>
  );
}

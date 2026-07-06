"use client";
import { motion } from "motion/react";
import { IconGithub, IconLinkedin, IconXTwitter } from "nucleo-social-media";
import { IconEnvelopeFill18 } from "nucleo-ui-essential-fill-18";
import { useState } from "react";

import { cn } from "@/lib/utils";

const socialLinks = [
  {
    id: 1,
    name: "rooh_builds",
    image: IconXTwitter,
    link: "https://x.com/roohbuilds",
  },
  {
    id: 2,
    name: "Sandeep Singh",
    image: IconLinkedin,
    link: "https://www.linkedin.com/in/sandeep-singh-43b6a921a/",
  },
  {
    id: 3,
    name: "dev.sandeepsingh28@gmail.com",
    image: IconEnvelopeFill18,
    link: "mailto:dev.sandeepsingh28@gmail.com",
  },
  {
    id: 4,
    name: "CoDesign-Spa27",
    image: IconGithub,
    link: "https://github.com/CoDesign-Spa27",
  },
];

export const Social = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  return (
    <motion.div className="flex items-center gap-2" onMouseLeave={() => setActiveTab("")}>
      {socialLinks.map((social) => {
        const isActive = activeTab === social.name;
        const IconComponent = social.image;
        return (
          <motion.a
            onMouseLeave={() => setActiveTab(social.name)}
            onMouseOver={() => setActiveTab(social.name)}
            onFocus={() => setActiveTab(social.name)}
            key={social.id}
            href={social.link}
            target="_blank"
            className="relative transition-colors p-1 "
            rel="noopener noreferrer"
            aria-label={social.name}
          >
            {isActive ? (
              <motion.div
                layoutId="liquid-glass-social-preview"
                className={cn(
                  "absolute inset-0 rounded-lg transition-colors",
                  "bg-neutral-200 shadow-[0px_32px_64px_-16px_transparent,0px_16px_32px_-8px_transparent,0px_8px_16px_-4px_transparent,0px_4px_8px_-2px_transparent,0px_-8px_16px_-1px_transparent,0px_2px_4px_-1px_transparent,0px_0px_0px_1px_transparent,inset_0px_0px_0px_1px_rgba(0,0,0,0.1),inset_0px_1px_0px_rgb(0,0,0,0.15)] dark:bg-neutral-800 dark:shadow-[0px_32px_64px_-16px_transparent,0px_16px_32px_-8px_transparent,0px_8px_16px_-4px_transparent,0px_4px_8px_-2px_transparent,0px_-8px_16px_-1px_transparent,0px_2px_4px_-1px_transparent,0px_0px_0px_1px_transparent,inset_0px_0px_0px_1px_rgba(255,255,255,0.1),inset_0px_1px_0px_rgb(255,255,255,0.15)]  ",
                )}
              />
            ) : null}
            <IconComponent className="relative z-10 w-6 h-6" />
          </motion.a>
        );
      })}
    </motion.div>
  );
};

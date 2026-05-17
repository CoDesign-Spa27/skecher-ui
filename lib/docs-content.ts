export type DocsSection = {
  title: string;
  body?: string;
  bullets?: string[];
  cards?: Array<{
    title: string;
    body: string;
  }>;
  commands?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  tree?: string[];
};

export type DocsPage = {
  title: string;
  slug: string;
  eyebrow: string;
  description: string;
  sections: DocsSection[];
};

export const DOCS_PAGES: DocsPage[] = [
  {
    title: "Project Overview",
    slug: "overview",
    eyebrow: "Skecher UI Library",
    description:
      "SKECHER UI is an animated UI library powered by React and Motion. Build modern, intuitive interfaces with smooth interactions and effortless customizability.",
    sections: [
      {
        title: "What This Library Optimizes For",
        body:
          "The documentation should introduce the system first, then move into install paths, component anatomy, registry delivery, navigation, styling, and release workflow. That gives each future component a predictable place to live without changing the visual identity of the site.",
        cards: [
          {
            title: "Animated components",
            body:
              "Components are designed around polished motion, preview-first documentation, and copyable source.",
          },
          {
            title: "Registry delivery",
            body:
              "The library ships through shadcn-compatible registry JSON files under public/r.",
          },
          {
            title: "Docs as product",
            body:
              "Each component page pairs a real preview with installation, dependencies, behavior, and customization notes.",
          },
        ],
      },
      {
        title: "Documentation Flow",
        bullets: [
          "Start with the library purpose and supported stack.",
          "Show the project structure before setup details.",
          "Document installation and registry commands before individual components.",
          "Keep each component page consistent: preview, code, details, dependencies, installation, and customization.",
          "End with release, build, and deployment guidance so maintainers know how changes ship.",
        ],
      },
    ],
  },
  {
    title: "Tech Stack & Dependencies",
    slug: "tech-stack",
    eyebrow: "Foundation",
    description:
      "The current Skecher UI app uses Next.js, React, Tailwind CSS, Motion, shadcn-compatible registry tooling, and small focused UI primitives.",
    sections: [
      {
        title: "Core Framework",
        table: {
          headers: ["Package", "Current Version", "Purpose"],
          rows: [
            ["next", "15.5.9", "App Router framework"],
            ["react", "19.1.0", "Component runtime"],
            ["react-dom", "19.1.0", "DOM renderer"],
            ["typescript", "^5.9.2", "Type safety"],
          ],
        },
      },
      {
        title: "UI, Motion, and Styling",
        table: {
          headers: ["Package", "Current Version", "Purpose"],
          rows: [
            ["tailwindcss", "^4.1.11", "Utility-first styling"],
            ["motion", "^12.38.0", "Component animation"],
            ["next-themes", "^0.4.6", "Light and dark themes"],
            ["lucide-react", "^0.487.0", "Icon system"],
            ["shadcn", "^3.0.0", "Registry build and install flow"],
          ],
        },
      },
      {
        title: "Component Utilities",
        bullets: [
          "class-variance-authority, clsx, and tailwind-merge keep variants and class composition predictable.",
          "Radix and shadcn-style primitives provide accessible building blocks.",
          "Shiki powers readable source display in component docs.",
        ],
      },
    ],
  },
  {
    title: "Project Structure",
    slug: "project-structure",
    eyebrow: "Architecture",
    description:
      "Skecher keeps app routes, documentation chrome, UI primitives, animated components, registry entries, and generation scripts in clear top-level folders.",
    sections: [
      {
        title: "Current Structure",
        tree: [
          "app/(docs)/docs/              # Documentation routes",
          "components/docs/layout/       # Header and sidebar chrome",
          "components/docs/ui/           # Docs-specific helpers",
          "components/ui/                # Shared UI primitives",
          "components/ui-components/     # Skecher animated components",
          "constants/sidebar-options.tsx # Docs navigation",
          "hooks/                        # Client hooks",
          "lib/                          # Utilities, registry helpers, content models",
          "public/r/                     # Generated registry JSON",
          "registry/new-york/            # Registry source files",
          "scripts/                      # Registry sync and build scripts",
        ],
      },
      {
        title: "Scaling Rule",
        body:
          "As the library grows, add component source under components/ui-components, registry source under registry/new-york, and documentation routes under app/(docs)/docs. Shared docs content should live in lib or components/docs so sidebar, pages, and metadata can read the same source.",
      },
    ],
  },
  {
    title: "Setup & Installation",
    slug: "setup",
    eyebrow: "Getting Started",
    description:
      "This flow documents the commands a maintainer or consumer needs before they work with Skecher UI locally or install a component.",
    sections: [
      {
        title: "Local Development",
        commands: ["bun install", "bun run dev"],
      },
      {
        title: "Registry Build",
        commands: ["bun run registry:build", "bun run gen-cli"],
      },
      {
        title: "Component Installation Pattern",
        body:
          "Component pages should expose CLI and manual paths through the existing InstallationTabs component. CLI entries use the registry alias, while manual steps name the source file, dependencies, and import path.",
        commands: ["npx shadcn@latest add @skecherui/streaming-text"],
      },
    ],
  },
  {
    title: "Core Configuration",
    slug: "core-configuration",
    eyebrow: "Configuration",
    description:
      "Core configuration explains how TypeScript, Next.js, Tailwind, shadcn, and path aliases fit together in this repository.",
    sections: [
      {
        title: "Configuration Files",
        table: {
          headers: ["File", "Role"],
          rows: [
            ["components.json", "shadcn aliases, style, Tailwind CSS entry, and registry aliases"],
            ["next.config.ts", "Next.js application configuration"],
            ["postcss.config.mjs", "Tailwind PostCSS integration"],
            ["tsconfig.json", "Strict TypeScript and @/* path aliases"],
            ["app/globals.css", "Theme tokens, Tailwind setup, and global styles"],
          ],
        },
      },
      {
        title: "Maintenance Notes",
        bullets: [
          "Keep registry aliases aligned with the public registry routes.",
          "Keep TypeScript strict so component APIs stay safe as the library grows.",
          "Keep global theme tokens centralized in app/globals.css.",
        ],
      },
    ],
  },
  {
    title: "Docs Engine",
    slug: "docs-engine",
    eyebrow: "Documentation System",
    description:
      "Skecher currently uses custom App Router pages instead of a full MDX source tree. The scalable path is to keep reusable docs sections in shared data and render them through consistent page components.",
    sections: [
      {
        title: "Current Engine",
        bullets: [
          "Routes live under app/(docs)/docs.",
          "The layout owns the shared header, sidebar, and PageWrapper shell.",
          "Component pages can remain server components so source files are read on the server before rendering CodeBlock.",
          "Reusable documentation content lives in lib/docs-content.ts.",
        ],
      },
      {
        title: "Future MDX Slot",
        body:
          "If the library later moves to MDX, the same page flow can become frontmatter plus sections: overview, install, usage, API, accessibility, customization, registry, and release notes.",
      },
    ],
  },
  {
    title: "Component Page System",
    slug: "component-pages",
    eyebrow: "Docs Components",
    description:
      "Component pages should preserve the current Skecher UI: a preview/code switcher, source copy action, and focused component documentation below the preview.",
    sections: [
      {
        title: "Recommended Page Anatomy",
        bullets: [
          "Preview and Code tabs in ComponentWrapper.",
          "A concise component summary.",
          "Inspiration, behavior, and customization cards.",
          "Dependency tags.",
          "InstallationTabs with CLI and manual setup.",
        ],
      },
      {
        title: "Existing Component Page",
        body:
          "Streaming Text already follows this structure. Future component pages should copy that rhythm and swap only the component-specific source, preview, and documentation details.",
      },
    ],
  },
  {
    title: "Registry System",
    slug: "registry-system",
    eyebrow: "Distribution",
    description:
      "The registry is the install surface for Skecher components. It maps component names to source files, dependencies, registry dependencies, and generated JSON output.",
    sections: [
      {
        title: "Registry Flow",
        bullets: [
          "Source files live under registry/new-york.",
          "registry.json describes each installable item.",
          "shadcn build generates public/r JSON files.",
          "lib/registry.ts resolves source files and prepares install targets.",
        ],
      },
      {
        title: "Add A Component",
        bullets: [
          "Create the component source.",
          "Add or update the registry item.",
          "Add a docs page with preview, code, dependencies, and install instructions.",
          "Run the registry build scripts and verify generated output.",
        ],
      },
    ],
  },
  {
    title: "Sidebar & Navigation",
    slug: "navigation",
    eyebrow: "Information Architecture",
    description:
      "Navigation should mirror the document flow: foundation pages first, component docs next, then examples and release operations.",
    sections: [
      {
        title: "Navigation Principles",
        bullets: [
          "Keep introduction and setup pages before component pages.",
          "Group components by purpose as the library grows.",
          "Avoid duplicate placeholder links.",
          "Generate sidebar items from shared docs data wherever possible.",
        ],
      },
      {
        title: "Current Groups",
        cards: [
          {
            title: "Start",
            body: "Home, project overview, tech stack, structure, setup, and core configuration.",
          },
          {
            title: "Build",
            body: "Docs engine, component pages, registry, navigation, theming, SEO, and deployment.",
          },
          {
            title: "Components",
            body: "Streaming Text and future Skecher UI components.",
          },
        ],
      },
    ],
  },
  {
    title: "Theming & Styling",
    slug: "theming",
    eyebrow: "Design System",
    description:
      "Skecher keeps the current UI language: rounded sidebar chrome, soft borders, light/dark logo variants, Raleway display type, and Motion-powered interaction.",
    sections: [
      {
        title: "Theme Sources",
        bullets: [
          "app/globals.css defines CSS custom properties and Tailwind theme aliases.",
          "ThemeProvider supplies system, light, and dark mode behavior.",
          "DocsHeader and DocsSidebar preserve the product-like documentation shell.",
          "ComponentWrapper keeps previews visually consistent across component pages.",
        ],
      },
      {
        title: "Styling Guidance",
        body:
          "When adding pages, use existing tokens and docs helpers before adding new one-off classes. New visual patterns should be promoted into components/docs/ui only when they repeat.",
      },
    ],
  },
  {
    title: "SEO & Metadata",
    slug: "seo",
    eyebrow: "Metadata",
    description:
      "Metadata should describe Skecher UI consistently so docs pages, social previews, and search snippets use the library name and purpose.",
    sections: [
      {
        title: "Recommended Metadata",
        table: {
          headers: ["Field", "Value"],
          rows: [
            ["Title", "Skecher UI"],
            [
              "Description",
              "An animated React UI component library powered by Motion and shadcn-compatible registry tooling.",
            ],
            ["Theme", "Light and dark mode through next-themes"],
          ],
        },
      },
      {
        title: "Next Steps",
        bullets: [
          "Add per-page metadata when pages become static content modules.",
          "Add OpenGraph images when the brand assets are finalized.",
          "Add sitemap and robots routes before public release.",
        ],
      },
    ],
  },
  {
    title: "Build & Deployment",
    slug: "build-deployment",
    eyebrow: "Release Flow",
    description:
      "Build and deployment docs give contributors a predictable checklist for validating the app and registry before shipping.",
    sections: [
      {
        title: "Validation Commands",
        commands: ["bun run build", "bun run registry:build", "bun run gen-cli"],
      },
      {
        title: "Release Checklist",
        bullets: [
          "Confirm docs pages render in light and dark mode.",
          "Confirm component previews and code tabs still work.",
          "Confirm registry JSON exists under public/r for installable components.",
          "Confirm generated files match the source components.",
        ],
      },
    ],
  },
];

export const COMPONENT_NAV_ITEMS = [
  {
    title: "Streaming Text",
    url: "/docs/streaming-text",
  },
  {
    title: "Showcase Project",
    url: "/docs/project-showcase",
  },
];

export function getDocsPage(slug: string) {
  return DOCS_PAGES.find((page) => page.slug === slug);
}

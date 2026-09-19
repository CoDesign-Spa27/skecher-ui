import type { ComponentDoc } from "@/lib/docs-content";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const INSTALL_PREFIX = "bunx --bun shadcn@latest add";

export function getComponentLlmPath(component: Pick<ComponentDoc, "slug">) {
  return `/llms/${component.slug}`;
}

export function getComponentLlmUrl(component: Pick<ComponentDoc, "slug">) {
  return absoluteUrl(getComponentLlmPath(component));
}

export function formatComponentLlmContext(component: ComponentDoc) {
  const dependencies =
    component.installDependencies ??
    component.dependencies.filter((dependency) => dependency !== "react");
  const implementationDetails = component.details.length
    ? component.details.map((detail) => `- ${detail.title}: ${detail.body}`).join("\n")
    : "- No additional implementation constraints are documented.";
  const files = component.files
    .map((file) => `- ${file.path}${file.description ? ` — ${file.description}` : ""}`)
    .join("\n");
  const assets = component.assets?.length
    ? `\n\n## Required assets\n\n${component.assets
        .map((asset) => `- ${asset.path}${asset.description ? ` — ${asset.description}` : ""}`)
        .join("\n")}`
    : "";

  return `# ${component.title} — ${siteConfig.name}

${component.description}

## Install

\`\`\`bash
${INSTALL_PREFIX} ${component.cliCommand}
\`\`\`

## Dependencies

${dependencies.length ? dependencies.map((dependency) => `- ${dependency}`).join("\n") : "- None beyond React."}

## Implementation guidance

${implementationDetails}

## Usage

\`\`\`tsx
${component.usage}
\`\`\`

## Source files

${files}${assets}

## Canonical resources

- Documentation: ${absoluteUrl(`/docs/${component.slug}`)}
- Registry item with complete source: ${absoluteUrl(`/r/${component.slug}.json`)}
- Component AI context: ${getComponentLlmUrl(component)}
`;
}

export function formatLlmCatalog(components: ComponentDoc[]) {
  const componentSections = components.map(formatComponentLlmContext).join("\n---\n\n");

  return `# ${siteConfig.name} — Complete component context

${siteConfig.description}

Skecher UI is a source-owned shadcn registry. Install a component, then adapt its copied source inside the consuming application. Components do not call an LLM provider or expose API keys; applications own model requests, server-side credentials, persistence, and safety policy.

## Integration rules for coding agents

1. Prefer the registry install command over recreating a component.
2. Preserve the component's accessible labels, keyboard behavior, reduced-motion behavior, and controlled-state API.
3. Keep provider SDKs and secret keys in the consuming application's server boundary.
4. Use component callbacks and controlled props to connect application data or streamed model output.
5. Check the component's documented dependencies and required assets before implementation.

## Component index

${components.map((component) => `- [${component.title}](${getComponentLlmUrl(component)}): ${component.description}`).join("\n")}

---

${componentSections}`;
}

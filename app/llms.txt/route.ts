import { COMPONENT_DOCS } from "@/lib/docs-content";
import { getComponentLlmUrl } from "@/lib/llm-content";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const componentLinks = COMPONENT_DOCS.map(
    (component) =>
      `- [${component.title}](${getComponentLlmUrl(component)}): ${component.description}`,
  ).join("\n");

  const body = `# ${siteConfig.name}

${siteConfig.description}

## Primary Pages

- [Home](${siteConfig.url}/)
- [Component Docs](${siteConfig.url}/docs)
- [Project Showcase](${siteConfig.url}/docs/project-showcase)
- [Complete LLM Context](${siteConfig.url}/llms-full.txt)

## Usage

Skecher UI is a source-owned shadcn registry. Use each component's AI context page for its install command, dependencies, implementation guidance, usage example, and complete-source registry link. Keep model credentials and provider calls in the consuming application's server boundary.

## Components

${componentLinks}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

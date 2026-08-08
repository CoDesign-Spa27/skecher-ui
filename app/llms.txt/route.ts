import { COMPONENT_DOCS } from "@/lib/docs-content";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const componentLinks = COMPONENT_DOCS.map(
    (component) =>
      `- [${component.title}](${siteConfig.url}/docs/${component.slug}): ${component.description}`,
  ).join("\n");

  const body = `# ${siteConfig.name}

${siteConfig.description}

## Primary Pages

- [Home](${siteConfig.url}/)
- [Component Docs](${siteConfig.url}/docs)
- [Project Showcase](${siteConfig.url}/docs/project-showcase)

## Components

${componentLinks}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

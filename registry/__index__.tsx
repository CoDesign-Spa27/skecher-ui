import type { RegistryItem } from "shadcn/schema";

import { ExampleForm } from "@/registry/new-york/blocks/example-form/example-form";
import { ExampleCard } from "@/registry/new-york/blocks/example-with-css/example-card";
import { HelloWorld } from "@/registry/new-york/blocks/hello-world/hello-world";

type RegistryIndexItem = RegistryItem & {
  component?: React.ComponentType;
};

export const Index: Record<string, RegistryIndexItem> = {
  "hello-world": {
    name: "hello-world",
    type: "registry:component",
    title: "Hello World",
    description: "A simple hello world component",
    registryDependencies: ["button"],
    files: [
      {
        path: "registry/new-york/blocks/hello-world/hello-world.tsx",
        type: "registry:component",
      },
    ],
    component: HelloWorld,
  },
  "example-form": {
    name: "example-form",
    type: "registry:component",
    title: "Example Form",
    description: "A contact form with Zod validation.",
    dependencies: ["zod"],
    registryDependencies: ["button", "input", "label", "textarea", "card"],
    files: [
      {
        path: "registry/new-york/blocks/example-form/example-form.tsx",
        type: "registry:component",
      },
    ],
    component: ExampleForm,
  },
  "example-with-css": {
    name: "example-with-css",
    type: "registry:component",
    title: "Example with CSS",
    description: "A login form with a CSS file.",
    files: [
      {
        path: "registry/new-york/blocks/example-with-css/example-card.tsx",
        type: "registry:component",
      },
      {
        path: "registry/new-york/blocks/example-with-css/example-card.css",
        type: "registry:component",
      },
    ],
    component: ExampleCard,
  },
  "complex-component": {
    name: "complex-component",
    type: "registry:component",
    title: "Complex Component",
    description: "A complex component showing hooks, libs and components.",
    registryDependencies: ["card"],
    files: [
      {
        path: "registry/new-york/blocks/complex-component/page.tsx",
        type: "registry:page",
        target: "app/pokemon/page.tsx",
      },
      {
        path: "registry/new-york/blocks/complex-component/components/pokemon-card.tsx",
        type: "registry:component",
      },
      {
        path: "registry/new-york/blocks/complex-component/components/pokemon-image.tsx",
        type: "registry:component",
      },
      {
        path: "registry/new-york/blocks/complex-component/lib/pokemon.ts",
        type: "registry:lib",
      },
      {
        path: "registry/new-york/blocks/complex-component/hooks/use-pokemon.ts",
        type: "registry:hook",
      },
    ],
  },
};


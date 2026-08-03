# Skecher UI

Skecher UI is an open-source collection of motion-focused React components built for the
shadcn CLI.

## Install from GitHub

The repository root is a shadcn source registry. Install any item directly from the public
GitHub repository:

```bash
bunx --bun shadcn@latest add CoDesign-Spa27/skecher-ui/sliding-panel
```

Use a tag or full commit SHA when you need a reproducible install:

```bash
bunx --bun shadcn@latest add CoDesign-Spa27/skecher-ui/sliding-panel#v1.0.0
```

Preview the resolved changes before writing files:

```bash
bunx --bun shadcn@latest add CoDesign-Spa27/skecher-ui/sliding-panel --dry-run
```

## Registry architecture

- [`registry.json`](./registry.json) is the single source catalog used by GitHub registry
  addresses.
- Component source files live in [`components/ui-components`](./components/ui-components).
- `/r/registry.json` serves the flattened catalog for list and search commands.
- `/r/<name>.json` resolves one installable item with its source content.
- The HTTP endpoints use the official `loadRegistry` and `loadRegistryItem` APIs from
  `shadcn/registry`; generated registry payloads are not committed.

## Validate the registry

```bash
bun run registry:validate
```

Validation checks the official schemas, unique item names, source-file existence, source
catalog coverage, package dependencies, bundled relative imports, and resolved item payloads.

To synchronize documentation stubs and then validate:

```bash
bun run sync-components
```

## Add a component

1. Add the component source to `components/ui-components/<name>.tsx`.
2. Add a flat item entry to the root `registry.json`.
3. Declare every directly imported npm package in `dependencies`.
4. Include every relative source import in the same item's `files` array.
5. Run `bun run registry:validate`.

The source `files` entries must reference committed files and must not contain an inline
`content` field.

<div align="center">
  <a href="https://github.com/CoDesign-Spa27/skecher-ui">
    <img src="public/ReadmeBanner.png" alt="Skecher UI" width="100%" />
  </a>

  <h1>Skecher UI</h1>

  <p>A collection of motion-focused React components for the shadcn CLI.</p>

  <p>
    <a href="https://github.com/CoDesign-Spa27/skecher-ui">GitHub</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/CoDesign-Spa27/skecher-ui/tree/main/components/ui-components">Components</a>
  </p>
</div>

## Install a component

Add a component directly to your project with the shadcn CLI:

```bash
bunx --bun shadcn@latest add CoDesign-Spa27/skecher-ui/sliding-panel
```

Replace `sliding-panel` with the component you want to install. Use `--dry-run` to preview
the files before adding them:

```bash
bunx --bun shadcn@latest add CoDesign-Spa27/skecher-ui/sliding-panel --dry-run
```

Components are copied into your project, so you can edit and style them to fit your needs.

## Run locally

```bash
git clone https://github.com/CoDesign-Spa27/skecher-ui.git
cd skecher-ui
bun install
bun run dev
```

Component source files are in [`components/ui-components`](./components/ui-components).

## Add a component

1. Add the component source to `components/ui-components/<name>.tsx`.
2. Add its entry to [`registry.json`](./registry.json).
3. Include its dependencies and any imported local files.
4. Validate the registry:

   ```bash
   bun run registry:validate
   ```

To sync component documentation and validate the registry, run:

```bash
bun run sync-components
```

## License

Skecher UI is open source. See the repository license for details.

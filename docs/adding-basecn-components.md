# Adding UI components (basecn)

This project follows **[basecn](https://basecn.dev/docs/get-started/introduction)**: shadcn/ui-style components rebuilt on **[Base UI](https://base-ui.com/)**. Prefer official basecn docs as the source of truth; this file only adds repo-specific paths.

## What basecn offers (official)

Per the [introduction](https://basecn.dev/docs/get-started/introduction):

- **shadcn/ui components:** Familiar APIs and styling.
- **Base UI foundation:** Accessibility and performance primitives.
- **Multiple examples:** Patterns per component (basic usage, variants, states, a11y).
- **Same philosophy:** Copy, paste, and customize — you own the source; TypeScript-first; Tailwind-styled; no lock-in.

Each **component** page includes installation via the shadcn CLI, examples, and API documentation — use that page before adding a component.

## Get started (official guides)

Follow these in the [basecn docs](https://basecn.dev/docs/get-started/introduction) when relevant:

| Guide | Use when |
|--------|-----------|
| [Introduction](https://basecn.dev/docs/get-started/introduction) | Understanding the stack and philosophy |
| [Namespaced registry](https://basecn.dev/docs/get-started/namespaced-registry) | Configuring `components.json` and `@basecn/...` installs |
| [RTL support](https://basecn.dev/docs/get-started/rtl-support) | Right-to-left layouts |
| [Migrating from Radix UI](https://basecn.dev/docs/get-started/migrating-from-radix-ui) | Replacing or comparing Radix-based code |
| [llms.txt](https://basecn.dev/llms.txt) | Machine-readable index of the docs site |

Browse **components** from the [docs sidebar / component list](https://basecn.dev/docs/get-started/introduction) (each component has its own URL under `/docs/components/...`).

## This repository

### `components.json`

Keep the namespaced registry exactly as [documented](https://basecn.dev/docs/get-started/namespaced-registry):

```json
"registries": {
  "@basecn": "https://basecn.dev/r/{name}.json"
}
```

Ensure `paths` / aliases (`@/components`, `@/lib/utils`, etc.) match [components.json](../components.json) so generated imports resolve.

### Install (shadcn CLI)

From the repo root, use the same pattern as the official namespaced-registry examples:

```bash
npx shadcn@latest add @basecn/<component-name>
```

Example:

```bash
npx shadcn@latest add @basecn/button
```

**Always open the component’s official doc page first.** The CLI argument must match the installation instructions on that page. Some features ship as **more than one implementation** (for example [Combobox (Base UI)](https://basecn.dev/docs/components/combobox-baseui) vs [Combobox (Popover + Command)](https://basecn.dev/docs/components/combobox)) — pick the doc that matches your UX, then use the install command and examples from **that** page.

### After installation

- Files land under **`src/components/ui/`** (or whatever `components.json` sets).
- Import with the `@/` alias, e.g. `import { Button } from '@/components/ui/button'`.
- Customize with Tailwind and **`cn()`** from [`src/lib/utils.ts`](../src/lib/utils.ts).

### When dependencies are not “pure” Base UI

Some recipes (e.g. command-menu stacks using [**cmdk**](https://cmdk.paco.me/)) may pull **Radix** transitively. That is expected for those patterns. Prefer `@basecn/...` for new UI; for Radix-heavy legacy code, see [Migrating from Radix UI](https://basecn.dev/docs/get-started/migrating-from-radix-ui).

## Official references (bookmark)

- [Introduction](https://basecn.dev/docs/get-started/introduction)
- [Namespaced registry](https://basecn.dev/docs/get-started/namespaced-registry)
- [RTL support](https://basecn.dev/docs/get-started/rtl-support)
- [Migrating from Radix UI](https://basecn.dev/docs/get-started/migrating-from-radix-ui)
- [llms.txt](https://basecn.dev/llms.txt)
- [Base UI](https://base-ui.com/)

# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Ripple Field is a **frontend-only** Vite + React 19 + Three.js SPA (no backend, no database, no Docker). It renders a WebGL point-grid field with interactive ripple animations triggered by clicks and keystrokes. UI components use basecn (shadcn/ui rebuilt on Base UI).

### Key commands

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Dev server | `pnpm dev` (Vite, default port 5173) |
| Type check | `npx tsc --noEmit` |
| Production build | `pnpm build` (`tsc && vite build`) |
| Preview build | `pnpm preview` |

### Gotchas

- **pnpm build scripts warning**: After `pnpm install`, esbuild's post-install script may be blocked by pnpm's `onlyBuiltDependencies` policy. If the dev server or build fails with esbuild-related errors, run `node node_modules/.pnpm/esbuild@*/node_modules/esbuild/install.js` to manually execute the post-install step.
- **No ESLint configured**: There is no ESLint configuration in this repo. Type checking via `tsc` is the only static analysis available.
- **No automated tests**: There are no test scripts or test frameworks configured.
- **Lockfile**: Both `pnpm-lock.yaml` and `package-lock.json` exist; use `pnpm` as the package manager (matching the lockfile used in development).
- **WebGL required**: The app requires a WebGL-capable browser. When testing via computerUse, Chrome works with the default software renderer.

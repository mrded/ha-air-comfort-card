# Repository Guidelines

## Project Structure & Module Organization
Custom card logic lives in `src/air-comfort-card.ts`, a single LitElement that renders the comfort dial and editor. Bundled output is emitted to `dist/air-comfort-card.js` via Rollup; only files in `dist/` and `hacs.json` are shipped to Home Assistant. Build tooling (`rollup.config.js`, `tsconfig.json`) sits in the root, along with documentation (`README.md`, `info.md`) and marketing assets such as `screenshot.png`. Use `public/index.html` as a lightweight playground to load the card outside Home Assistant while developing.

## Build, Test, and Development Commands
- `bun install` (or `npm install`): install dependencies defined in `package.json`.
- `bun run build` / `npm run build`: run Rollup (`rollup -c`) to produce `dist/air-comfort-card.js`.
- `bun run watch`: watch files and rebuild on change for rapid iteration.
- `bun run lint`: execute ESLint on `src/**/*.ts`; fix violations before pushing.
- `bun run start:dev`: rebuild, link `dist/` into `public/`, then serve `public/` at `http://localhost:<port>/`.
If you prefer Node, ensure v16+ so Lit and Rollup compile cleanly.

## Coding Style & Naming Conventions
Code is TypeScript-first with Lit 2. Follow the existing 2-space indentation, single quotes, and trailing commas for multiline literals. Keep helpers pure and colocated near their usages unless shared by multiple visual elements. Class names stay in PascalCase, internal members camelCase, and custom elements kebab-case (e.g., `air-comfort-card`). Run ESLint before committing; configure your editor to respect `tsconfig.json` path rules.

## Testing Guidelines
There is no automated test harness yet, so rely on manual verification: open `public/index.html` via `bun run start:dev` for layout checks, then load the built card in a Home Assistant dev instance to confirm entity wiring. When adding behavior, document mock entities or config used for testing in the PR description so reviewers can reproduce.

## Commit & Pull Request Guidelines
Git history favors concise, imperative messages (`add hacs validator`, `add a CI to make screenshots`). Keep the first line under 72 characters and describe *why* in optional body text. For PRs, include: summary of user-visible changes, screenshots/GIFs for UI updates, reproduction/testing notes, and links to related issues or discussions. Ensure lint/build pass locally before requesting review, and keep PRs narrowly scoped to simplify review for other agents.

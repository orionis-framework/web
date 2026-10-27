# Orionis Framework Web

Official bilingual landing page for Orionis Framework.

## Runtime

Use Node.js 24 LTS (>=24.15.0). Node.js 22 (>=22.22.2) and Node.js >=26 are also supported.
Install the locked dependencies with `npm ci` and start development with `npm run dev`.

## Dependency Compatibility

TypeScript 7 provides `tsc`; the official TypeScript 6 compatibility package supplies the API required by Next.js and ESLint.
ESLint 10 uses the official Next.js Core Web Vitals and React Hooks plugins directly, alongside TypeScript ESLint, ESLint React, import-x, and the maintained jsx-a11y-x accessibility plugin. This keeps the lint toolchain current without incompatible legacy plugin peers.
Run `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` to validate changes.
Run `npm audit` to check the complete dependency tree for known vulnerabilities. The local preview server's `compression` dependency is overridden to `^1.8.2` until `serve` includes the patched version upstream.
The reviewed install scripts for `@parcel/watcher`, `@swc/core`, and `unrs-resolver` are explicitly denied. Supported platforms use their packaged native binaries; optional source-build/download fallbacks are unnecessary for this project.
After building, run `npm run check:links` to verify exported pages, assets, and anchors. Run `npm run check:links:external` to also check external destinations over HTTP.
Vitest covers code-tab navigation and copying, the ASGI/RSGI selector, project statistics (including partial API failures), and accessible lifecycle navigation without WebGL in both languages.

## Landing Page

The English and Spanish routes are `/en/` and `/es/`. The landing follows the official Orionis API and documentation design tokens.
The Three.js hero is a procedural Orionis reactor using the site's navy, blue, cyan, and yellow palette: machined hexagonal layers, a suspended four-point star, gyroscopic rings, six detailed docks, and optical request/response flows. Component names are integrated directly into the model's plaques. Visitors can rotate, zoom from 72% to 185% with buttons, the mouse wheel, or a two-finger pinch, and reset the framing to 100%. Studio lighting and physical materials require no remote textures or model assets. Five selectable lifecycle stages distinguish process startup, repeated request/response scopes, and shutdown. Pause, layer separation, reduced motion, and the no-WebGL fallback remain available. Rendering stops while paused, offscreen, or in a hidden tab, with a lower frame rate and pixel ratio on small screens.
The viewer reserves its layout during initialization and reveals only the final 3D scene after its first rendered frame. No alternate diagram is displayed while loading; browsers without WebGL receive a short localized message while the lifecycle controls remain usable.
The capability content is based on the framework package READMEs. Code examples adapt the official Reactor stubs and show their generator commands.
The ten examples cover HTTP, ORM, jobs, MCP servers, commands, middleware, mail, tests, migrations, and facades. The ORM query belongs to an async function; running it requires a configured Orionis application and database.
The footer creates Orionis projects with `uvx --from orionis-installer orionis new`.

Titillium Web and JetBrains Mono are bundled locally in `src/app/fonts`; their OFL licenses are included in `public/licenses` and the static export. No font CDN is required at build time or in the browser.
GitHub stars and the latest PyPI release are fetched from the official public APIs using Next.js's default build-fetch policy and refreshed in the browser with `no-store`. The release card shows the neutral PyPI name until the browser lookup settles, then reveals a single version, avoiding a stale-to-current version flash. Build data is used only as a fallback when that source fails. Each source can fail independently without breaking the page.
Canonical URLs, language alternatives, Open Graph, Twitter previews, and the sitemap are generated for both languages. Social previews use the local `public/images/seo/seo.png` image.

## Search Indexing

`public/robots.txt` allows crawlers and advertises `https://orionis-framework.com/sitemap.xml`. The static export includes readable content without requiring JavaScript, localized canonical URLs, and `index, follow` metadata. Tests cover the crawler permissions and indexing metadata, and deployment verifies that the exported robots.txt matches the source file.

Keep `/robots.txt`, `/sitemap.xml`, `/en/`, and `/es/` publicly accessible over HTTPS with HTTP 200 responses. Each documentation/API subdomain needs its own crawl policy and sitemap. For project sub-path deployments, serve robots.txt at the host root and update its sitemap URL to the deployed sitemap.

## Third-Party Assets

The Granian logo identifies the upstream HTTP server without implying endorsement. The displayed `public/images/brands/granian.png` is trimmed and resized without changing its colors.
The upstream BSD-3-Clause notice is preserved in `public/licenses/granian-BSD-3-Clause.txt` and linked from the footer.

## Static Deployment

`npm run build` exports the website to `out`. Serve this directory with a static host; no Next.js server is needed in production.
Set `NEXT_PUBLIC_BASE_PATH` before building when publishing under a project sub-path. Public asset URLs and locale links respect this setting.
Publish only `out/`. Source files, tests, dependency directories, local environment files, caches, and validation reports are not deployment artifacts. Generated files and local tooling output are excluded from Git by `.gitignore`.

The GitHub Pages workflow runs on pushes to `master` or manual dispatch. It installs the locked dependencies with npm on Node.js 24, audits every dependency, checks formatting, types, lint and tests, builds Next.js, validates the exported pages and assets, and deploys `out` to the `github-pages` environment.
The custom-domain build uses an empty base path and copies `public/CNAME` containing `orionis-framework.com` into the export. In the repository settings, select **GitHub Actions** as the Pages source, set the custom domain, configure its DNS records, and enable HTTPS. A CNAME file alone does not configure DNS or GitHub Pages settings.

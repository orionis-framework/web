# Orionis Framework Web

Official bilingual landing page for Orionis Framework.

## Runtime

Use Node.js 24 LTS (>=24.15.0). Node.js 22 (>=22.22.2) and Node.js >=26 are also supported.
Install the locked dependencies with `npm ci` and start development with `npm run dev`.

## Dependency Compatibility

TypeScript 7 provides `tsc`; the official TypeScript 6 compatibility package supplies the API required by Next.js and ESLint.
ESLint uses the latest 9.x release because Next.js plugins do not yet support 10.x. The 9.x branch is upstream end-of-life.
Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` to validate changes.
Vitest covers code-tab navigation and copying, the ASGI/RSGI selector, and project statistics, including partial API failures.

## Landing Page

The English and Spanish routes are `/en/` and `/es/`. The landing follows the official Orionis API and documentation design tokens.
The hero uses a Three.js application stack with orbit, pause, layer separation, reduced-motion support, and a no-WebGL fallback.
The capability content is based on the framework package READMEs. Code examples adapt the official Reactor stubs and show their generator commands.
The ten examples cover HTTP, ORM, jobs, MCP servers, commands, middleware, mail, tests, migrations, and facades. The ORM query belongs to an async function; running it requires a configured Orionis application and database.
The footer creates Orionis projects with `uvx --from orionis-installer orionis new`.

Titillium Web and JetBrains Mono are bundled locally in `src/app/fonts` with their OFL licenses. No font CDN is required at build time or in the browser.
GitHub stars and the latest PyPI release are fetched from the official public APIs at build time and refreshed in the browser. Each source can fail independently without breaking the page.
Canonical URLs, language alternatives, Open Graph, Twitter previews, and the sitemap are generated for both languages. Social previews use the local `public/images/seo/seo.png` image.

## ChatGPT Crawling and Search

`public/robots.txt` allows all crawlers and explicitly allows `OAI-SearchBot` and `GPTBot`. It advertises `https://orionis-framework.com/sitemap.xml`.
`OAI-SearchBot` is used for ChatGPT search; `GPTBot` crawls content that may be used for model training. Their permissions are independent, and allowing GPTBot is not required to appear in ChatGPT search.
`ChatGPT-User` visits pages on behalf of users rather than automatically crawling for search; OpenAI notes that robots.txt rules may not apply to these user-initiated requests.

The static export includes readable page content without requiring JavaScript, localized canonical URLs, and `index, follow` metadata. Tests cover the crawler permissions and indexing metadata, and deployment verifies that the exported robots.txt matches the source file.

Keep `/robots.txt`, `/sitemap.xml`, `/en/`, and `/es/` publicly accessible over HTTPS with HTTP 200 responses, without login requirements, CAPTCHA challenges, or `noindex` HTTP headers or metadata.
If adding a CDN, firewall, or bot protection, allow the published OpenAI IP ranges as well as the user agents. See the [official OpenAI crawler documentation](https://developers.openai.com/api/docs/bots), including the current [SearchBot IP ranges](https://openai.com/searchbot.json) and [GPTBot IP ranges](https://openai.com/gptbot.json).
Each documentation/API subdomain needs its own crawl policy and sitemap; this site's robots.txt only controls this host. For project sub-path deployments, robots.txt must still be served at the host root and its sitemap URL must point to the deployed sitemap.

Allowing crawling does not guarantee indexing, ranking, or citations in ChatGPT. OpenAI says search systems can take approximately 24 hours to adjust to robots.txt updates. An `llms.txt` file is not a documented prerequisite for OpenAI crawling or ChatGPT search.

## Third-Party Assets

The Granian logo identifies the upstream HTTP server without implying endorsement. Its original PNG is retained in `public/images/brands/granian-original.png`; the displayed `granian.png` copy is trimmed and resized without changing its colors.
The upstream BSD-3-Clause notice is preserved in `public/licenses/granian-BSD-3-Clause.txt` and linked from the footer.

## Static Deployment

`npm run build` exports the website to `out`. Serve this directory with a static host; no Next.js server is needed in production.
Set `NEXT_PUBLIC_BASE_PATH` before building when publishing under a project sub-path. Public asset URLs and locale links respect this setting.

The GitHub Pages workflow runs on pushes to `master` or manual dispatch. It installs the locked dependencies with npm on Node.js 24, checks types, lint and tests, builds Next.js, validates the exported pages and assets, and deploys `out` to the `github-pages` environment.
The custom-domain build uses an empty base path and copies `public/CNAME` containing `orionis-framework.com` into the export. In the repository settings, select **GitHub Actions** as the Pages source, set the custom domain, configure its DNS records, and enable HTTPS. A CNAME file alone does not configure DNS or GitHub Pages settings.
At validation, `npm audit --omit=dev` reported no vulnerabilities; the full audit reported seven high-severity development-tool alerts in the ESLint and `serve` dependency trees. No forced downgrades were applied.

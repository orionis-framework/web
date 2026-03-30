# Orionis Framework — Landing Page

Official landing page for the **Orionis Framework**, a high-performance async Python framework powered by a Rust-based HTTP core ([Granian](https://github.com/emmett-framework/granian) RSGI).

🌐 **Live site:** [orionis-framework.com](https://orionis-framework.com/)
📦 **Main framework:** [github.com/orionis-framework/framework](https://github.com/orionis-framework/framework)
📖 **Documentation:** [docs.orionis-framework.com](https://docs.orionis-framework.com/)

---

## What is Orionis?

Orionis is a framework for building async web applications and APIs in Python, featuring an elegant architecture inspired by the best industry patterns:

- **Rust-Powered HTTP Core** — Uses Granian (RSGI) as its HTTP server, achieving ~455k projected req/s with framework overhead.
- **Layered Architecture** — HTTP/CLI → Service Layer → Core (IoC, Scheduler, Exception Handler) → Infrastructure.
- **Dependency Injection** — IoC container with automatic resolution via type annotations (singleton, transient, scoped).
- **Service Providers** — Explicit service registration with `register()` and `boot()` lifecycles.
- **Reactor CLI** — Component generation, dev server, task scheduler, testing, and more.
- **Native Testing** — Testing suite designed for async applications with parallel execution.
- **Built-in Security** — Authentication, middleware, and OWASP compliance by design.

```bash
pip install orionis
```

---

## About This Repository

This repository contains **only the landing page** for the framework, built as a static site with:

| Technology | Version | Role |
|---|---|---|
| [Astro](https://astro.build/) | ^5.1.3 | Static site generator |
| [Tailwind CSS](https://tailwindcss.com/) | 4.0.0-beta.8 | Utility-first CSS framework |
| [TypeScript](https://www.typescriptlang.org/) | — | Static typing |

### Page Sections

| Component | Description |
|---|---|
| `HeroSection` | Hero with canvas constellation animation, dynamic version from PyPI |
| `Features` | 6 glass-morphism cards showcasing framework capabilities |
| `Nucleus` | 3 real code examples with syntax highlighting (bootstrap, providers, CLI) |
| `Architecture` | Visualization of the framework's 4-layer architecture |
| `Stats` | Performance benchmarks based on TechEmpower Round 22 |
| `News` | Compact CTA with install command and copy-to-clipboard |

### Design System

- **Theme:** Dark-first (`#0a0e1a` base)
- **Fonts:** Inter (UI) + JetBrains Mono (code)
- **Palette:** Cyan `#4CC9F0` · Gold `#F4C430` · Dark blue `#134675`
- **Effects:** Glass-morphism, gradient text, scroll reveal animations, Dracula-inspired syntax tokens

---

## Quick Start

### Requirements

- Node.js 22+
- pnpm (recommended) or npm

### Installation

```bash
git clone https://github.com/orionis-framework/web.git
cd web
pnpm install
```

### Development

```bash
pnpm dev
```

Open `http://localhost:4321` in your browser.

### Production Build

```bash
pnpm build
```

Generated files will be in `./dist`.

### Local Build Preview

```bash
pnpm preview
```

---

## Project Structure

```
src/
├── components/
│   ├── AppHeader.astro        # Fixed nav with blur on scroll
│   ├── AppFooter.astro        # Footer with GitHub stars counter
│   ├── HeroSection.astro      # Main hero with particle canvas
│   ├── Features.astro         # Features grid
│   ├── Nucleus.astro          # Real code showcase
│   ├── Architecture.astro     # Framework layer diagram
│   ├── Stats.astro            # Performance metrics
│   ├── News.astro             # Install CTA
│   ├── Container.astro        # Content wrapper
│   └── Blog.astro             # (Reserved)
├── layouts/
│   └── Layout.astro           # Global layout, styles, fonts, SEO
├── pages/
│   └── index.astro            # Main page
├── tailus.css                 # Theme CSS variables
└── env.d.ts                   # Environment types
```

---

## Deployment

The site deploys automatically to **GitHub Pages** on every push to `master`.

**Workflow:** `.github/workflows/jekyll-gh-pages.yml`
- Node.js 22 + pnpm
- Build: `pnpm install --frozen-lockfile && pnpm build`
- Deploy via `actions/deploy-pages@v4`
- Custom domain: `orionis-framework.com`

---

## Contributing

Contributions are welcome! Follow these steps:

### 1. Fork & Setup

```bash
git clone https://github.com/<your-username>/web.git
cd web
pnpm install
pnpm dev
```

### 2. Create a Branch

```bash
git checkout -b feature/my-improvement
```

### 3. Make Your Changes

- Components live in `src/components/`. Each `.astro` file is self-contained (markup + styles + scripts).
- Global styles and design tokens are in `src/layouts/Layout.astro` and `src/tailus.css`.
- Make sure the build passes before submitting:

```bash
pnpm build
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: clear description of the change"
git push origin feature/my-improvement
```

### 5. Open a Pull Request

Open a PR targeting the `master` branch of the original repository with a clear description of your changes.

### Conventions

- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`).
- **Code:** Formatted with Prettier (configuration included in the project).
- **Components:** Keep the one-component-per-section structure. Each `.astro` file includes its own HTML, `<style>`, and `<script>` when needed.
- **Styles:** Use Tailwind CSS utilities. For custom styles, add them to the component's `<style>` block or to `Layout.astro` for global styles.

### Areas Where You Can Contribute

- **New sections** — Comparisons, testimonials, framework roadmap.
- **Visual improvements** — Animations, transitions, responsive edge cases.
- **Performance** — Image optimization, lazy loading, bundle reduction.
- **Accessibility** — ARIA labels, keyboard navigation, contrast.
- **i18n** — Multi-language support for the landing page.
- **Content** — Corrections, benchmark updates, new code examples.

---

## License

This project is licensed under the MIT License. See [LICENCE.md](LICENCE.md) for details.

---

**Orionis Framework** © 2023 – 2026 Raúl Mauricio Uñate Castro & Orionis Framework Team

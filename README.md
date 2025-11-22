# 🚀 Orionis Framework - Astro Theme

A modern and elegant theme built with Astro and TailwindCSS, designed to create fast and attractive websites with an exceptional development experience.

## ✨ Features

- 🌟 **Built with Astro 5.1.3** - Modern web framework for blazing fast sites
- 🎨 **TailwindCSS 4.0 Beta** - Next-generation utility-first CSS framework
- ⚡ **Optimized performance** - Static sites with ultra-fast loading
- 📱 **Responsive design** - Perfect on all devices
- 🌙 **Dark mode** - Native support for light/dark themes
- 🎯 **SEO optimized** - Ready-to-go search engine configuration
- 🔧 **TypeScript ready** - Full TypeScript support

## 🏗️ Project Structure

```
astro-theme/
├── public/                 # Static files
│   ├── CNAME              # Domain configuration
│   └── images/            # Images and assets
│       ├── code/          # Code-related images
│       └── logo/          # Logos and branding
├── src/
│   ├── components/        # Reusable components
│   │   ├── AppFooter.astro      # Footer
│   │   ├── AppHeader.astro      # Navigation header
│   │   ├── Blog.astro           # Blog section
│   │   ├── Container.astro      # Base container
│   │   ├── Features.astro       # Features section
│   │   ├── HeroSection.astro    # Main hero section
│   │   ├── News.astro           # News section
│   │   ├── Nucleus.astro        # Nucleus component
│   │   └── Stats.astro          # Statistics section
│   ├── layouts/
│   │   └── Layout.astro         # Main layout
│   ├── pages/
│   │   └── index.astro          # Home page
│   ├── env.d.ts           # Environment type definitions
│   └── tailus.css         # Custom styles
├── astro.config.mjs       # Astro configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── prettier.config.mjs    # Prettier configuration
```

## 📦 Dependencies

### Core
- **[Astro](https://astro.build/)** `^5.1.3` - Modern web framework
- **[TailwindCSS](https://tailwindcss.com/)** `4.0.0-beta.8` - Utility-first CSS framework
- **[@tailwindcss/vite](https://github.com/tailwindlabs/tailwindcss/tree/next/packages/@tailwindcss-vite)** `4.0.0-beta.8` - Vite plugin for TailwindCSS
- **[astro-font](https://github.com/rishi-raj-jain/astro-font)** `^0.0.72` - Font optimization for Astro

### Development Tools
- **[TypeScript](https://www.typescriptlang.org/)** - Static typing
- **[Prettier](https://prettier.io/)** - Code formatter
- **[pnpm](https://pnpm.io/)** - Fast and efficient package manager

## 🚀 Quick Start

### Prerequisites
- Node.js 22 or higher
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/orionis-framework/web.git
   cd web
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   
   Visit `http://localhost:4321` to see the site in development.

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm start` | Alias for `pnpm dev` |
| `pnpm build` | Build the site for production |
| `pnpm preview` | Preview the production build locally |

## 🌐 Deployment

This project is configured to automatically deploy to **GitHub Pages** using GitHub Actions.

### Automatic Deployment
- Every push to the `master` branch automatically deploys the site
- The workflow uses pnpm for faster installation
- Includes optimized caching for efficient builds

### Manual Deployment
To deploy manually:

```bash
pnpm build
# Generated files will be in ./dist
```

## 🎨 Customization

### TailwindCSS
The project uses TailwindCSS 4.0 Beta with Vite configuration. You can customize:

- Colors and themes in Tailwind configuration
- Custom components in `src/tailus.css`
- Gradients and visual effects in components

### Components
All components are in `src/components/` and are fully customizable:

- **HeroSection**: Main section with animated gradients
- **Features**: Feature showcase
- **Blog/News**: Content sections
- **Stats**: Statistics and metrics

## 🔧 Configuration

### Astro Config
```javascript
{
  output: "static",        // Static site generation
  vite: {
    plugins: [tailwindcss()] // TailwindCSS plugin
  }
}
```

### TypeScript
The project includes complete TypeScript configuration for a better development experience.

## 🤝 Contributing

Contributions are welcome. To contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the license specified in `LICENCE.md`.

## 🏢 About the Project

**Orionis Framework** is a set of tools and themes designed to create modern and efficient web experiences. This Astro theme is part of the Orionis ecosystem.

---

⭐ If you like this project, give it a star on GitHub!

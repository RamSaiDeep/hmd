# HMD Design System

## Color Palette

Your app uses a modern **Teal & Slate** color system designed for professional technical environments.

### Primary Brand Color: Teal
- **Primary Dark** (`--color-primary-dark`): `#0d5c57` - Deep foundations
- **Primary** (`--color-primary`): `#0f766e` - Main brand color
- **Primary Light** (`--color-primary-light`): `#14b8a6` - Interactive elements, buttons
- **Primary Lighter** (`--color-primary-lighter`): `#5eead4` - Highlights, hover states

### Neutral Colors (Dark Theme)
- **Background** (`--color-bg`): `#0f172a` - Main background
- **Background Secondary** (`--color-bg-secondary`): `#1a2332` - Sections, cards
- **Background Tertiary** (`--color-bg-tertiary`): `#253448` - Elevated elements
- **Text** (`--color-text`): `#f1f5f9` - Primary text
- **Text Secondary** (`--color-text-secondary`): `#cbd5e1` - Secondary text
- **Text Tertiary** (`--color-text-tertiary`): `#94a3b8` - Dimmed text
- **Border** (`--color-border`): `#334155` - Borders and dividers

### Accent Colors
- **Cyan** (`--color-accent-cyan`): `#06b6d4` - Secondary highlights
- **Emerald** (`--color-accent-emerald`): `#10b981` - Success states, team Kriti
- **Amber** (`--color-accent-amber`): `#f59e0b` - Warnings, team Prakash
- **Red** (`--color-accent-red`): `#ef4444` - Errors, destructive actions

## Typography
- **Sans Serif**: Geist (headings and body text)
- **Monospace**: Geist Mono (code snippets)

## Components Styled
✅ Navbar - Modern header with auth dropdown
✅ Hero Section - Large, engaging hero with gradient text
✅ Category Cards - Interactive service category cards
✅ Team Section - Three departments with hover effects
✅ Stats Section - Key metrics display
✅ Footer - Cohesive footer with branding

## Usage
All CSS variables are defined in `app/globals.css` and use the `--color-*` naming convention. Use these in your components for consistency:

```jsx
<button className="bg-[var(--color-primary-light)]">Action</button>
<p className="text-[var(--color-text-secondary)]">Supporting text</p>
```

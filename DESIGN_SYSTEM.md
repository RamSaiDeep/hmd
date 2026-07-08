# HMD Design System

## Overview

HMD uses a **dark-first design system** with neon accent colors and OkLch color tokens for modern, accessible UI across all themes.

## Color Palette

### Primary Colors (OkLch-based)
- **Background**: `oklch(0.08 0 0)` - Deep dark background
- **Foreground**: `oklch(0.92 0.02 260)` - Light text for contrast
- **Card**: `oklch(0.12 0.01 255)` - Elevated card backgrounds
- **Border**: `oklch(0.20 0.01 255)` - Subtle dividers

### Accent Colors (Neon)
These vibrant neon colors are used for interactive elements, highlights, and status indicators:
- **Neon Blue** (`--neon-blue`): `#00d4ff` - Primary action, links
- **Neon Gold** (`--neon-gold`): `#ffd700` - Secondary actions, in-progress states
- **Neon Green** (`--neon-green`): `#39ff14` - Success, completed states
- **Neon Purple** (`--neon-purple`): `#bf00ff` - Special highlights

### Semantic Colors
- **Primary**: `oklch(0.55 0.2 250)` - Buttons, links, focus states
- **Accent**: `oklch(0.6 0.2 45)` - Alternative highlights
- **Destructive**: `oklch(0.577 0.245 27.325)` - Dangerous actions, errors
- **Muted**: `oklch(0.25 0.02 255)` - Disabled, secondary text
- **Success**: Emerald-500 (`#10b981`)
- **Warning**: Amber-500 (`#f59e0b`)

## Typography
- **Sans Serif**: Inter (body), Outfit (headings)
- **Monospace**: Geist Mono (code)
- **Font Weight**: 600-800 for headings, 400-500 for body

## Component Styling

### Navbar
- Sticky header with glassmorphism background
- Responsive: Hidden elements on mobile, full nav on desktop
- User dropdown with role-based navigation links

### Cards & Glass Effects
- Use `glass` class for frosted glass effect with blur
- Rounded corners: `rounded-xl` (0.75rem)
- Borders: Subtle with `border-border/80` opacity

### Forms & Inputs
- Rounded inputs: `rounded-xl`
- Focus state: `focus:border-primary focus:ring-2 focus:ring-primary/30`
- Dark background with light text

### Buttons
- Primary: `bg-primary text-primary-foreground hover:bg-primary/90`
- Outline: `border border-border bg-background text-foreground`
- Sizes: sm, md (default), lg

### Status Indicators
- Resolved: Green (Neon Green for highlights)
- In Progress: Gold (Neon Gold)
- Pending: Yellow/Muted
- Error: Red (Destructive)

## Responsive Design

### Breakpoints
- **Mobile**: `<640px` (default, no `sm:`)
- **Tablet**: `640px+` (`sm:`, `md:`)
- **Desktop**: `1024px+` (`lg:`)

### Layout Patterns
- Full-width on mobile (px-4 padding)
- Constrained max-width on desktop (`max-w-7xl`)
- Flexible grid layouts with gap spacing

## Theme Support

### Dark Mode (Default)
- All CSS variables use OkLch values optimized for dark backgrounds
- High contrast text for readability
- Neon accents pop against dark backgrounds

### Light Mode (Future)
- CSS variables can be overridden in `@media (prefers-color-scheme: light)`
- Components should respect user preference via `next-themes`

## Usage Guidelines

All color values are defined in `app/globals.css` using CSS custom properties:

```css
:root {
  --background: oklch(0.08 0 0);
  --foreground: oklch(0.92 0.02 260);
  --neon-blue: #00d4ff;
  /* ... */
}
```

Use Tailwind classes with these color tokens:

```jsx
// Good: Use semantic theme variables
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Action
</button>

// Also good: Direct color usage with opacity
<div className="bg-neon-blue text-black">Highlight</div>

// Avoid: Hardcoded colors not in theme
<button className="bg-cyan-500">❌ Breaks dark mode</button>
```

## Best Practices

1. **Always use theme colors** from globals.css
2. **Test in dark mode** - it's the primary theme
3. **Maintain contrast ratios** - WCAG AA minimum
4. **Use semantic colors** (destructive, muted) for meaning
5. **Leverage opacity** for layering and hierarchy (`/80`, `/50`, `/30`, `/10`)
6. **Mobile-first** - start with mobile styles, add responsive modifiers
7. **Component consistency** - reuse button, card, input classes across pages

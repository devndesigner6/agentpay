# AgentPay Design System

## Visual World: OpenRouter Replica

## Color System

### Dark Mode (Default)
```css
:root {
  --bg-primary: #0D0D0F;
  --bg-secondary: #1E1E24;
  --bg-tertiary: #2A2A35;
  --card-bg: #252530;
  --border-color: #3A3A45;
  --text-primary: #F5F5F5;
  --text-secondary: #A0A0B0;
  --text-muted: #707080;
  --accent-blue: #3B82F6;
  --accent-gradient: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%);
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
}
```

### Light Mode
```css
:root[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  --card-bg: #FFFFFF;
  --border-color: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
}
```

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Scale
| Size | pixels | rem | usage |
|------|--------|-----|-------|
| xs | 12px | 0.75rem | labels, helper text |
| sm | 14px | 0.875rem | body, buttons |
| base | 16px | 1rem | body copy |
| lg | 18px | 1.125rem | headings |
| xl | 20px | 1.25rem | section headers |
| 2xl | 24px | 1.5rem | h2 |
| 3xl | 32px | 2rem | hero headline |
| 4xl | 40px | 2.5rem | main headline |
| 5xl | 48px | 3rem | hero primary |

### Weights
- **Headings**: 700
- **Subheadings**: 600
- **Body**: 400
- **Captions**: 300

## Components

### Buttons

```css
.btn-primary {
  background: var(--accent-gradient);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}
```

### Cards

```css
.card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.15);
}
```

### Input Fields

```css
.input {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px 16px;
  color: var(--text-primary);
  font-size: 16px;
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

## Layout

### Container
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}
```

### Spacing Scale
| Size | pixels | rem |
|------|--------|-----|
| xs | 8px | 0.5rem |
| sm | 16px | 1rem |
| md | 24px | 1.5rem |
| lg | 32px | 2rem |
| xl | 48px | 3rem |
| 2xl | 64px | 4rem |
| 3xl | 96px | 6rem |

## Navigation

```css
.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.nav-link.active {
  color: var(--accent-blue);
  background: rgba(59, 130, 246, 0.1);
}
```

## Icons

- **Size**: 24px default, 20px for nav
- **Stroke**: 2px
- **Color**: var(--text-primary) or var(--text-secondary)

## Dashboard Components

### Stats Card
```css
.stats-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
}

.stats-card .stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.stats-card .stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}
```

### Provider Card
```css
.provider-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
}

.provider-name {
  font-weight: 600;
  color: var(--text-primary);
}

.provider-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.provider-price {
  color: var(--success);
  font-weight: 600;
}
```

### Search Bar
```css
.search-bar {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 16px;
  gap: 12px;
}

.search-bar .search-icon {
  color: var(--text-muted);
}

.search-bar input {
  background: transparent;
  border: none;
  outline: none;
  flex: 1;
  color: var(--text-primary);
}
```

## Animation

### Transitions
- **Button hover**: 0.2s ease
- **Card hover**: 0.2s ease
- **Modal fade**: 0.3s ease
- **Fade in**: 0.5s ease

### Delays
- **Staggered card load**: 0.1s increment

## Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

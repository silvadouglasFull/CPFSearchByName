# AppShell Navigation Logic - Technical Specification

**Version:** 1.0  
**Date:** May 8, 2026  
**Component:** AppShell (Navigation Shell)

---

## 1. Overview

The AppShell component manages the overall layout structure and determines whether to display the sidebar. It distinguishes between "landing layout" (legal pages + home) and "app layout" (content pages with sidebar).

---

## 2. Component Location

**File:** `src/components/navigation/app-shell.tsx`

---

## 3. Core Logic

### Route Detection

```typescript
const pathname = usePathname();
const isLegalPage = ['/', '/terms-of-use', '/privacy-policy', '/contact'].includes(pathname);
const isLandingPage = isLegalPage;
```

**Routes that use Landing Layout (no sidebar):**
- `/` — Home / Landing page
- `/privacy-policy` — Privacy Policy legal page
- `/terms-of-use` — Terms of Use legal page
- `/contact` — Contact page

**Routes that use App Layout (with sidebar):**
- All other routes (e.g., `/filter-by-cpf`, `/generator-cpf`, etc.)

---

## 4. Conditional Rendering

### Landing Layout (if isLandingPage)

**Rendered when:** `isLandingPage === true`

```tsx
<div className="relative min-h-screen w-full bg-linear-to-br from-background to-muted/30">
  {/* Mobile-only header */}
  <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:hidden">
    <BrandLogo />
    <div className="flex items-center gap-2">
      <ThemeSwitcher />
      <HamburgerTrigger isOpen={isSidebarOpen} onToggle={toggleSidebar} />
    </div>
  </header>

  {/* Desktop theme switcher */}
  <div className="absolute top-4 right-4 z-30 hidden md:block">
    <ThemeSwitcher />
  </div>

  {/* Mobile modal overlay and sidebar */}
  <div className={cn('fixed inset-0 z-40 bg-black/45 transition-opacity md:hidden', ...)} />
  <div className={cn('fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transition-transform md:hidden', ...)} >
    <Sidebar className="min-h-full rounded-none" onNavigate={closeSidebar} />
  </div>

  {/* Main content */}
  <div className="flex min-h-screen w-full">{children}</div>
</div>
```

**Features:**
- Full-width layout
- Gradient background
- Mobile header with hamburger
- Desktop theme switcher (top-right)
- Mobile sidebar modal (overlay)
- Centered content
- No desktop sidebar

### App Layout (else)

**Rendered when:** `isLandingPage === false`

```tsx
<div className="flex min-h-screen w-full items-stretch bg-linear-to-br from-background to-muted/30">
  {/* Desktop sidebar */}
  <div className="hidden w-80 shrink-0 self-stretch md:flex">
    <Sidebar className="flex-1 rounded-none" />
  </div>

  {/* Main content area */}
  <div className="relative flex min-w-0 flex-1 flex-col">
    {/* Mobile header */}
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:hidden">
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">verifyDocs</p>
        <p className="text-sm font-semibold tracking-tight">Navigation</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <HamburgerTrigger isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </div>
    </header>

    {/* Mobile modal overlay and sidebar */}
    <div className={cn('fixed inset-0 z-40 bg-black/45 transition-opacity md:hidden', ...)} />
    <div className={cn('fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transition-transform md:hidden', ...)} >
      <Sidebar className="min-h-full rounded-none" onNavigate={closeSidebar} />
    </div>

    {/* Main content */}
    <div className="flex-1">{children}</div>
  </div>
</div>
```

**Features:**
- Desktop sidebar always visible (320px fixed width)
- Mobile header with app title
- Mobile hamburger opens modal sidebar
- Content area flexible
- Responsive grid layout

---

## 5. Sidebar Behavior

### Desktop (md breakpoint)

| Route Type | Sidebar Visible |
|-----------|-----------------|
| Legal pages (`/`, `/privacy-policy`, `/terms-of-use`, `/contact`) | ✗ No |
| App pages (`/filter-by-cpf`, etc.) | ✓ Yes |

### Mobile (< md breakpoint)

| Route Type | Sidebar in Header | Hamburger |
|-----------|-----------------|-----------|
| Legal pages | ✓ Modal (hidden by default) | ✓ Yes |
| App pages | ✓ Modal (hidden by default) | ✓ Yes |

---

## 6. State Management

### State Variables

```typescript
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
```

- **Type:** boolean
- **Initial:** false (sidebar closed on page load)
- **Purpose:** Track mobile sidebar modal open/close state
- **Scope:** Component-level (no global state)

### State Functions

```typescript
function closeSidebar(): void {
  setIsSidebarOpen(false);
}

function toggleSidebar(): void {
  setIsSidebarOpen((previous) => !previous);
}
```

- **closeSidebar:** Called when:
  - User clicks overlay (backdrop)
  - User navigates via sidebar link
- **toggleSidebar:** Called when:
  - User clicks hamburger menu button

---

## 7. Component Props

### AppShellProps

```typescript
interface AppShellProps {
  children: React.ReactNode;
}
```

- **children:** React content to render inside the layout
- **Type:** React.ReactNode
- **Required:** Yes

---

## 8. CSS Class Breakdown

### Layout Classes

```
flex                        # Flexbox container
min-h-screen                # Minimum full viewport height
w-full                      # Full width
items-stretch               # Children stretch to container height
bg-linear-to-br from-... to-...  # Gradient background (top-left to bottom-right)
```

### Sidebar (Desktop)

```
hidden                      # Hidden on mobile
w-80                        # 320px width
shrink-0                    # Don't shrink (maintain width)
self-stretch                # Stretch to full height
md:flex                     # Visible on desktop and up
```

### Sidebar (Mobile Modal)

```
fixed                       # Fixed positioning
inset-y-0                   # Full height (top: 0, bottom: 0)
left-0                      # Left edge
z-50                        # High z-index (above overlay)
w-80                        # 320px width
max-w-[85vw]                # Max 85% of viewport width
transition-transform        # Smooth animation
translate-x-0               # Fully visible when open
-translate-x-full           # Hidden when closed (off-screen)
md:hidden                   # Hidden on desktop
```

### Overlay (Mobile)

```
fixed                       # Fixed positioning
inset-0                     # Full viewport (top/right/bottom/left: 0)
z-40                        # Below sidebar (z-50)
bg-black/45                 # Translucent black
transition-opacity          # Smooth fade
opacity-100                 # Visible when sidebar open
pointer-events-none         # No interaction when hidden
opacity-0                   # Invisible when sidebar closed
```

---

## 9. Responsive Behavior

### Mobile (< 768px / < md)

**Layout:**
- Single column
- Full-width content
- Header always visible
- Sidebar as modal overlay

**Header:**
- App logo/title
- Theme switcher
- Hamburger menu

**Sidebar:**
- Hidden by default
- Opens as modal (fixed, overlay)
- Closes on navigation

### Desktop (≥ 768px / ≥ md)

**Layout:**
- Two-column (sidebar + content)
- Fixed sidebar (320px)
- Content area flexible

**Header:**
- Theme switcher (absolute top-right)
- No hamburger menu

**Sidebar:**
- Always visible
- Desktop styling
- Scrollable content

---

## 10. Route-Specific Behavior

### Legal Page: `/privacy-policy`

1. `pathname = '/privacy-policy'`
2. `isLegalPage = true` (matches in array)
3. `isLandingPage = true`
4. **Landing layout rendered:**
   - No desktop sidebar
   - Mobile: header + hamburger
   - Content: privacy policy page
   - Optional modal sidebar (hamburger trigger)

### App Page: `/filter-by-cpf`

1. `pathname = '/filter-by-cpf'`
2. `isLegalPage = false` (does not match)
3. `isLandingPage = false`
4. **App layout rendered:**
   - Desktop: always-visible sidebar
   - Mobile: header + hamburger
   - Content: app page
   - Mobile sidebar modal (hamburger trigger)

---

## 11. Z-Index Stack

```
z-50   Sidebar modal (mobile)
z-40   Overlay backdrop (mobile)
z-30   Headers, sticky elements
```

**Guarantee:** Sidebar always above overlay, overlay above content

---

## 12. Animation & Transitions

### Sidebar Modal (Mobile)

```
transition-transform        # Animate transform property
translate-x-0               # Fully visible
-translate-x-full           # Hidden (off-screen left)
md:hidden                    # No animation on desktop (always hidden)
```

**Behavior:**
- Smooth slide-in from left
- Smooth slide-out to left
- Duration: browser default (~300ms)

### Overlay

```
transition-opacity          # Animate opacity
opacity-100                 # Fully visible
opacity-0                   # Fully transparent
```

**Behavior:**
- Smooth fade in
- Smooth fade out
- Duration: browser default (~300ms)

---

## 13. Accessibility

### Semantic HTML

- `<header>` — landmark region
- `<main>` or `<div>` for content area
- Sidebar `<aside>` (via Sidebar component)

### Keyboard Navigation

- Tab order: header controls → sidebar links → main content
- Escape key: closes mobile sidebar (if implemented)
- Focus management: trap focus in modal when open (best practice)

### Screen Readers

- "Navigation" label in app page header
- Sidebar marked as navigation landmark
- Hamburger button labeled "Open menu" / "Close menu"

### Visual Indicators

- Focus-visible rings on interactive elements
- Hover states on links and buttons
- Color contrast meets WCAG AA

---

## 14. Testing Scenarios

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('renders landing layout on home page', () => {
    // Mock usePathname to return '/'
    // Expect: no sidebar visible, hamburger present (mobile)
  });

  it('renders app layout on app page', () => {
    // Mock usePathname to return '/filter-by-cpf'
    // Expect: sidebar visible (desktop), hamburger present (mobile)
  });

  it('renders legal pages without sidebar', () => {
    // Mock usePathname to return '/privacy-policy', '/terms-of-use', '/contact'
    // Expect: landing layout (no sidebar)
  });

  it('toggles sidebar on hamburger click', async () => {
    // Click hamburger
    // Expect: sidebar modal becomes visible
    // Click again or overlay
    // Expect: sidebar modal hides
  });
});
```

### Integration Tests

- Navigate between legal and app pages
- Sidebar visibility toggles correctly
- Theme switcher works on both layouts
- Hamburger menu functionality on mobile

### E2E Tests

- User navigates `/` → sees landing layout
- User navigates `/filter-by-cpf` → sees app layout + sidebar
- User navigates `/privacy-policy` → sees landing layout (no sidebar)
- Mobile: hamburger toggles sidebar modal
- Desktop: sidebar always visible (app pages)

---

## 15. Dependencies

| Import | From | Purpose |
|--------|------|---------|
| HamburgerTrigger | @/components/navigation/hamburger-trigger | Mobile menu toggle |
| Sidebar | @/components/navigation/sidebar | Navigation sidebar |
| ThemeSwitcher | @/components/navigation/theme-switcher | Theme selector |
| cn | @/lib/utils | CSS class merging (classnames) |
| usePathname | next/navigation | Get current route |
| useState | react | State management |
| BrandLogo | @/components/brand/brand-logo | Logo component |

---

## 16. Performance

### Rendering

- Component re-renders on pathname change (via usePathname hook)
- State change (isSidebarOpen) only affects mobile overlay
- Desktop sidebar always mounted but conditionally styled (hidden)

### Bundle

- ~500 bytes (minified)
- No heavy dependencies
- Conditional rendering optimized by Next.js

### Network

- No API calls
- No external resources
- CSS compiled by Tailwind

---

## 17. Known Limitations

1. **Hard-coded routes:** Legal routes are hard-coded in array; no dynamic detection
2. **No focus trap:** Mobile modal doesn't trap focus (should be improved)
3. **No transition end handling:** Sidebar doesn't wait for animation to complete
4. **Escape key:** Not implemented to close mobile sidebar (browser behavior only)

---

## 18. Future Enhancements

1. **Dynamic route detection:** Use pathname patterns instead of array
2. **Focus management:** Trap focus in modal, restore on close
3. **Keyboard shortcuts:** Cmd/Ctrl+K to open sidebar
4. **Animation config:** Customizable transition duration
5. **Sidebar persistence:** Remember sidebar state across sessions (mobile)
6. **Breadcrumb navigation:** Show route hierarchy
7. **Analytics:** Track layout switches and sidebar toggles

---

## 19. Maintenance Notes

### Updates

- When adding new legal pages, add route to `isLegalPage` array
- When removing routes, update array accordingly
- Test responsive behavior after changes

### Monitoring

- Check for layout shift issues (CLS)
- Monitor performance on slow devices
- Test on various mobile screen sizes

### Common Issues

- **Sidebar not showing on app pages:** Check `isLegalPage` logic and pathname
- **Overlay blocking clicks:** Check z-index order and pointer-events
- **Mobile layout shift:** Verify padding/margin consistency

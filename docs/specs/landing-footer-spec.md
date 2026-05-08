# Landing Footer Component - Technical Specification

**Version:** 1.0  
**Date:** May 8, 2026  
**Component:** LandingFooter

---

## 1. Overview

The LandingFooter component displays branding, copyright, and links to legal pages on the landing page. It consists of two columns: branding/copyright on the left, legal links on the right.

---

## 2. Component Location

**File:** `src/components/landing/landing-footer.tsx`

---

## 3. Component Props

**None** — this is a standalone component with no configurable props.

---

## 4. JSX Structure

```tsx
<footer className="border-t pt-6 text-sm text-muted-foreground">
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    {/* Left column: Branding */}
    <div className="flex flex-col gap-2">
      <p>Verify Docs</p>
      <p>
        <Link 
          className="transition-colors hover:text-foreground" 
          href="https://dswebdev.com.br/"
        >
          DS Web Dev
        </Link>
        {' '} © 2026
      </p>
    </div>

    {/* Right column: Legal links */}
    <div className="flex flex-wrap gap-4">
      <Link className="transition-colors hover:text-foreground" href="/privacy-policy">
        Privacy Policy
      </Link>
      <Link className="transition-colors hover:text-foreground" href="/terms-of-use">
        Terms of Use
      </Link>
      <Link className="transition-colors hover:text-foreground" href="/contact">
        Contact
      </Link>
    </div>
  </div>
</footer>
```

---

## 5. Styling Details

### Container Classes

```
border-t              # Top border for separation
pt-6                  # Padding top
text-sm               # Font size
text-muted-foreground # Text color
```

### Layout Classes

```
flex                            # Flexbox
flex-col                        # Column on mobile
gap-3                           # Gap between columns
md:flex-row                     # Row on desktop
md:items-center                 # Vertical center alignment (desktop)
md:justify-between              # Space-between (desktop)
```

### Left Column (Branding)

```
flex flex-col   # Column layout
gap-2           # Gap between lines
```

- **"Verify Docs"**: Plain `<p>` tag, default text color
- **"DS Web Dev © 2026"**: `<p>` containing:
  - `<Link>` with hover transition to foreground
  - `{' '}` whitespace separator
  - © symbol and year

### Right Column (Links)

```
flex        # Flexbox
flex-wrap   # Wrap to next line on narrow screens
gap-4       # Gap between links
```

Each link:
- `transition-colors`: smooth hover effect
- `hover:text-foreground`: color change on hover
- Default text: `text-muted-foreground`

---

## 6. Links

### Privacy Policy

- **Route:** `/privacy-policy`
- **Text:** "Privacy Policy"
- **Navigation:** Internal (Next.js Link)
- **Target:** New page (no target="_blank")

### Terms of Use

- **Route:** `/terms-of-use`
- **Text:** "Terms of Use"
- **Navigation:** Internal (Next.js Link)
- **Target:** New page (no target="_blank")

### Contact

- **Route:** `/contact`
- **Text:** "Contact"
- **Navigation:** Internal (Next.js Link)
- **Target:** New page (no target="_blank")

### DS Web Dev

- **URL:** `https://dswebdev.com.br/`
- **Text:** "DS Web Dev" (clickable) + "© 2026"
- **Navigation:** External (HTML <a> or Next.js Link with external URL)
- **Target:** Recommended: `_blank` with `rel="noreferrer noopener"`

---

## 7. Usage

**Parent:** `app/page.tsx` (HomePage)

**Placement:** Inside `<main>` element, after all content sections

```tsx
import { LandingFooter } from '@/components/landing/landing-footer';

export default function HomePage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <LandingModulesNavbar modules={LANDING_MODULES} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
        <LandingHero />
        <section className="space-y-6 md:space-y-8">
          {LANDING_MODULES.map((module, index) => (
            <LandingModuleSection key={module.link.href} index={index} module={module} />
          ))}
        </section>
        <LandingFooter />  {/* ← Rendered here */}
      </main>
    </div>
  );
}
```

---

## 8. Responsive Behavior

### Mobile (< md breakpoint)

- Layout: **Vertical stack** (flex-col)
- Column alignment: default (flex-start)
- Spacing between: gap-3
- Width: full container width

**Visual:**
```
┌─────────────────┐
│ Verify Docs     │
│ DS Web Dev © 20 │  (wrapped)
├─────────────────┤
│ Privacy Policy  │
│ Terms of Use    │
│ Contact         │
└─────────────────┘
```

### Desktop (≥ md breakpoint)

- Layout: **Horizontal row** (md:flex-row)
- Column alignment: **space-between** (md:justify-between)
- Vertical centering: **center** (md:items-center)
- Spacing: remains gap-3 but interpreted as column gap

**Visual:**
```
┌─────────────────────────────────────────────────────────┐
│ Verify Docs                Privacy Policy  Terms of Use│
│ DS Web Dev © 2026                           Contact      │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Color & Typography

### Text Colors

| Element | Color Class | Context |
|---------|-------------|---------|
| "Verify Docs" | text-muted-foreground (footer level) | Static label |
| "DS Web Dev" link | text-muted-foreground + hover:text-foreground | Interactive, color change |
| "© 2026" | text-muted-foreground | Static text |
| Legal links | text-muted-foreground + hover:text-foreground | Interactive |

### Typography

- **Font Size:** `text-sm` (14px / 0.875rem)
- **Font Weight:** Default (400)
- **Line Height:** Default
- **Font Family:** Inherited from root (Geist Sans)

---

## 10. Accessibility

### Semantic HTML

- `<footer>` — landmark role
- `<p>` — paragraphs for text content
- `<Link>` — accessible navigation links
- Text labels describe link destination ("Privacy Policy", "Terms of Use", "Contact")

### Keyboard Navigation

- All links are tab-focusable
- Enter key activates links
- Focus order: left column links first, then right column links (natural DOM order)

### Focus Styles

- Next.js `Link` inherits focus-visible styles
- Hover states visible (color transition)
- No focus indicator override; relies on browser default or global styles

### Screen Readers

- "Privacy Policy link" — link text is descriptive
- "Terms of Use link" — link text is descriptive
- "Contact link" — link text is descriptive
- "DS Web Dev link" — link text is descriptive
- © 2026 — copyright symbol rendered as HTML entity

---

## 11. Performance

### Bundle Size

- ~150 bytes (minified, excluding imports)
- No dynamic rendering or heavy computations
- Static component (no hooks, state, or effects)

### Rendering

- Server-rendered (no 'use client' directive)
- No client-side re-renders (static props)
- CSS classes compiled by Tailwind at build time

### Network

- No external font requests
- No additional API calls
- All images/assets inline or cached

---

## 12. Testing Scenarios

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { LandingFooter } from './landing-footer';

describe('LandingFooter', () => {
  it('renders Verify Docs branding', () => {
    render(<LandingFooter />);
    expect(screen.getByText('Verify Docs')).toBeInTheDocument();
  });

  it('renders DS Web Dev link', () => {
    render(<LandingFooter />);
    const link = screen.getByRole('link', { name: /DS Web Dev/i });
    expect(link).toHaveAttribute('href', 'https://dswebdev.com.br/');
  });

  it('renders legal links', () => {
    render(<LandingFooter />);
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Terms of Use/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contact/i })).toBeInTheDocument();
  });

  it('renders copyright year', () => {
    render(<LandingFooter />);
    expect(screen.getByText(/© 2026/)).toBeInTheDocument();
  });
});
```

### Integration Tests

- Footer renders on landing page
- Links navigate to correct routes
- External link opens in correct context
- Footer does NOT render on app pages (with sidebar)
- Responsive layout adjusts correctly on breakpoint

### E2E Tests

- User navigates to landing page
- Scrolls to footer
- Clicks "Privacy Policy" → navigates to /privacy-policy
- Clicks "DS Web Dev" → opens https://dswebdev.com.br/
- Verifies footer styling on mobile/desktop

---

## 13. Dependencies

| Import | From | Purpose |
|--------|------|---------|
| Link | next/link | Client navigation |

---

## 14. Known Limitations

1. **Static text:** "© 2026" is hardcoded; not dynamic
2. **No internationalization:** English only
3. **No analytics:** Link clicks not tracked
4. **External link:** DS Web Dev link may open in same tab (behavior depends on user OS/browser preferences)

---

## 15. Future Enhancements

1. Dynamic copyright year (new Date().getFullYear())
2. Multi-language support
3. Configurable links (props-based)
4. Social media links section
5. Analytics tracking on link clicks
6. Dark mode color adjustments (if different from current)
7. Accessibility improvements: explicit focus indicators

---

## 16. Maintenance

### Updates

- Update "© 2026" to "© 2027" on January 1, 2027
- Verify links target correct URLs annually
- Test responsive layout on major Tailwind updates

### Monitoring

- Check for broken links (404s on /privacy-policy, /terms-of-use, /contact)
- Monitor external link (DS Web Dev) availability
- Track user navigation from footer links (via analytics)

# Sidebar Legal Links Section - Technical Specification

**Version:** 1.0  
**Date:** May 8, 2026  
**Component:** Sidebar Legal Section

---

## 1. Overview

The Legal Links section is a dedicated area within the Sidebar component that displays links to Privacy Policy, Terms of Use, and Contact pages. It's positioned below the main navigation links with a visual separator and distinctive label.

---

## 2. Component Location

**File:** `src/components/navigation/sidebar.tsx`

---

## 3. Data Structure

### LEGAL_LINKS Constant

```typescript
const LEGAL_LINKS = [
    {
        href: '/privacy-policy',
        icon: Shield,
        label: 'Privacy Policy',
    },
    {
        href: '/terms-of-use',
        icon: FileText,
        label: 'Terms of Use',
    },
    {
        href: '/contact',
        icon: Mail,
        label: 'Contact',
    },
] as const;
```

**Type Definition:**
```typescript
type LegalLink = {
  href: string;
  icon: typeof Shield;  // Lucide React icon component
  label: string;
}
```

**Characteristics:**
- Immutable (`as const`)
- Parallel structure to NAVIGATION_LINKS
- Three items only (fixed)
- Each item has route, icon, and label

---

## 4. JSX Structure

### Full Section Markup

```tsx
<div className="mt-6 border-t pt-4">
  {/* Section label */}
  <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
    Legal
  </p>

  {/* Links container */}
  <div className="space-y-2">
    {LEGAL_LINKS.map((link) => {
      const isActive = pathname === link.href;
      const Icon = link.icon;

      return (
        <Link
          className={cn(
            'flex items-center rounded-2xl border px-3 py-3 text-sm transition-colors',
            'focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-2',
            isActive
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-transparent hover:border-border hover:bg-muted/60',
          )}
          href={link.href}
          key={link.href}
          onClick={onNavigate}
        >
          <Icon className="mr-3 size-4 shrink-0" />
          <span>{link.label}</span>
        </Link>
      );
    })}
  </div>
</div>
```

---

## 5. Styling Details

### Container Classes

```
mt-6              # Top margin (space from navigation section)
border-t          # Top border (separator)
pt-4              # Padding top
```

### Section Label

```
mb-2              # Margin bottom
px-3              # Horizontal padding (aligns with links)
text-xs           # Extra small font size
font-medium       # Medium font weight (500)
uppercase         # Uppercase text transform
tracking-wide     # Increased letter spacing
text-muted-foreground  # Color
```

**Visual Result:** "LEGAL" text, small, centered over section

### Links Container

```
space-y-2         # Gap between links (0.5rem)
```

### Individual Link Classes

**Base:**
```
flex                  # Flexbox for icon + label
items-center          # Vertical center alignment
rounded-2xl           # Rounded corners (1.5rem)
border                # Visible border
px-3                  # Horizontal padding
py-3                  # Vertical padding (equal height)
text-sm               # Font size
transition-colors     # Smooth color transition
```

**Focus State:**
```
focus-visible:ring-ring/60        # Focus ring color
focus-visible:outline-none        # Remove default outline
focus-visible:ring-2              # Ring width
```

**Active State (current route):**
```
border-primary/30         # Subtle primary border
bg-primary/10             # Very light primary background
text-primary              # Primary text color
```

**Inactive State (default/hover):**
```
border-transparent        # No visible border (default)
hover:border-border       # Border appears on hover
hover:bg-muted/60         # Light background on hover
```

### Icon Classes

```
mr-3              # Right margin (gap from label)
size-4            # 1rem (16px) square
shrink-0          # Don't shrink (maintain size)
```

---

## 6. Icon Mapping

| Label | Icon | Component |
|-------|------|-----------|
| Privacy Policy | Shield | `lucide-react/Shield` |
| Terms of Use | FileText | `lucide-react/FileText` |
| Contact | Mail | `lucide-react/Mail` |

**Icon Size:** 4 × 4 (1rem × 1rem)

**Icon Color:** Inherited from parent text color (primary on active, foreground on hover)

---

## 7. Active Route Detection

### Logic

```typescript
const pathname = usePathname();
const isActive = pathname === link.href;
```

**Routes and Active States:**

| Current Route | Active Link |
|--------------|------------|
| `/privacy-policy` | Privacy Policy (highlighted) |
| `/terms-of-use` | Terms of Use (highlighted) |
| `/contact` | Contact (highlighted) |
| `/filter-by-cpf` | None (all inactive) |
| `/` | None (legal section hidden anyway) |

**Behavior:**
- On navigation to legal page, matching link highlights
- On navigation away, highlighting removed
- Multiple active states: not possible (one route at a time)

---

## 8. Responsive Behavior

### Desktop (md and up)

- Section always visible (sidebar visible)
- Full width within sidebar (320px)
- All three links display horizontally stacked
- Icons visible next to labels
- Sufficient spacing for mouse interaction

### Mobile (< md)

- Section visible when sidebar modal open
- Full width within modal sidebar
- Same visual treatment as desktop
- Sufficient touch target size (py-3 = 12px top/bottom padding)

**Touch Target Size:** 44×44px minimum (achieved via py-3 and rounded-2xl)

---

## 9. User Interaction

### Click Behavior

1. **User clicks a legal link**
2. Component calls `onNavigate()` prop (passed from sidebar)
3. Parent component closes mobile sidebar (if open)
4. Next.js `Link` navigates to route
5. Page renders legal page content
6. Sidebar re-renders with updated `pathname`
7. Active state highlights corresponding link

### Hover Behavior

1. **User hovers over inactive link**
2. Border appears: `border-border`
3. Background tints: `bg-muted/60`
4. Color transition: smooth (~200ms)

### Focus Behavior

1. **User tabs to link or clicks**
2. Focus ring visible: `ring-ring/60`
3. Ring size: 2px
4. Outline removed: `outline-none`

---

## 10. Accessibility

### Semantic HTML

- `<Link>` (from Next.js) — semantic navigation element
- Icon: Lucide React SVG with `aria-hidden` (implicit in component)
- Label: Plain text, descriptive link text
- Section label: `<p>` with `uppercase` text transform

### Keyboard Navigation

- Tab order: follows DOM order (after main navigation links)
- Enter key: activates link
- Focus styles: visible ring (focus-visible:ring-2)
- No trap: user can tab through and out

### Screen Readers

- Link text: "Privacy Policy", "Terms of Use", "Contact"
- Icon: hidden from screen reader (decorative)
- Active state: CSS only; not announced to screen reader
  - **Improvement:** Add `aria-current="page"` to active link

### Color Contrast

| State | Foreground | Background | Contrast |
|-------|-----------|------------|----------|
| Inactive (default) | muted-foreground | background | 4.5:1 (passes WCAG AA) |
| Inactive (hover) | muted-foreground | muted/60 | 7:1+ (passes WCAG AAA) |
| Active | primary | primary/10 | ~4.5:1 (passes WCAG AA) |

---

## 11. Performance

### Bundle Size

- `LEGAL_LINKS` constant: ~200 bytes
- Section JSX: ~400 bytes (compiled)
- Total: ~600 bytes

### Rendering

- Static content (no state)
- Map over 3 items (minimal loop)
- CSS compiled by Tailwind (tree-shaken)
- No dynamic imports

### Network

- No API calls
- No external resources
- Icons: inline SVG (Lucide)

---

## 12. Testing Scenarios

### Unit Tests

```typescript
describe('Sidebar Legal Links', () => {
  it('renders all three legal links', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Terms of Use/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contact/i })).toBeInTheDocument();
  });

  it('shows section label "Legal"', () => {
    render(<Sidebar />);
    expect(screen.getByText(/Legal/i)).toBeInTheDocument();
  });

  it('displays correct icons for each link', () => {
    render(<Sidebar />);
    // Lucide icons are SVG; check aria-label or classes
    const privacyIcon = screen.getByRole('link', { name: /Privacy Policy/i }).querySelector('svg');
    expect(privacyIcon).toBeInTheDocument();
  });

  it('highlights active legal link based on pathname', () => {
    // Mock usePathname to return '/privacy-policy'
    render(<Sidebar />);
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toHaveClass('border-primary/30', 'bg-primary/10');
  });

  it('has correct hrefs for each link', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute('href', '/privacy-policy');
    expect(screen.getByRole('link', { name: /Terms of Use/i })).toHaveAttribute('href', '/terms-of-use');
    expect(screen.getByRole('link', { name: /Contact/i })).toHaveAttribute('href', '/contact');
  });

  it('calls onNavigate when link clicked', async () => {
    const onNavigate = jest.fn();
    render(<Sidebar onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('link', { name: /Privacy Policy/i }));
    expect(onNavigate).toHaveBeenCalled();
  });
});
```

### Integration Tests

- Sidebar renders legal section on app pages
- Sidebar does NOT render legal section on landing/legal pages
- Click legal link → navigates to correct page
- Active highlighting updates after navigation

### E2E Tests

- User navigates to app page
- Scrolls sidebar to see legal section
- Clicks "Privacy Policy"
- Navigates to `/privacy-policy`
- Sidebar closes on mobile after click
- On app page again, link highlights when current route is legal route

---

## 13. Dependencies

| Import | From | Purpose |
|--------|------|---------|
| Shield | lucide-react | Privacy Policy icon |
| FileText | lucide-react | Terms of Use icon |
| Mail | lucide-react | Contact icon |
| Link | next/link | Navigation link |
| usePathname | next/navigation | Get current route |
| cn | @/lib/utils | CSS class merging |

---

## 14. Known Limitations

1. **Hard-coded links:** Routes are fixed in LEGAL_LINKS array; no dynamic configuration
2. **No aria-current:** Active state not announced to screen readers
3. **No icons tooltip:** Icon doesn't have hover tooltip on desktop
4. **Separator style:** Border-top may be subtle on some themes
5. **No badge/indicator:** No visual indicator (e.g., "NEW" or "REQUIRED")

---

## 15. Future Enhancements

1. **Dynamic links:** Accept links as props for customization
2. **Accessibility:** Add `aria-current="page"` to active link
3. **Tooltips:** Hover tooltip on icons for clarity
4. **Badges:** Add status badges (e.g., "REQUIRED", "NEW")
5. **Sections:** Nested sections (e.g., "Legal", "Support", "Community")
6. **Analytics:** Track clicks on legal links
7. **Theme customization:** Section color, label text via props

---

## 16. Styling Variants

### Alternative Styles

**Option 1: Minimal (current)**
- Border separates sections
- Muted label
- Simple links

**Option 2: Card-based**
- Rounded card container around section
- More contrast with background
- Subtle shadow

**Option 3: Accent color**
- Label and icon in primary color
- Active state more pronounced
- Better visual hierarchy

---

## 17. Maintenance

### Updates

- Add new legal link: Update LEGAL_LINKS array
- Remove legal link: Remove from array
- Change icons: Update icon imports
- Change routes: Update href values
- Test responsive layout on Tailwind updates

### Monitoring

- Check for broken links (404s)
- Monitor user click analytics on legal links
- Test on various devices and screen sizes

### Common Issues

- **Link not highlighting:** Check `usePathname()` hook, pathname matching
- **Icon not showing:** Verify lucide-react import, icon component name
- **Section hidden:** Check AppShell logic (legal section only shows on app pages)
- **Styling issues:** Verify Tailwind classes, no CSS conflicts

---

## 18. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 8, 2026 | Initial implementation |

---

## 19. Related Components

- **Sidebar** — Parent component
- **AppShell** — Determines when sidebar displays
- **NAVIGATION_LINKS** — Main navigation (same structure as LEGAL_LINKS)
- **LegalPage** — Layout for legal pages

# Legal Pages Implementation - Technical Specification

**Version:** 1.0  
**Date:** May 8, 2026  
**Component:** Legal Pages & Navigation

---

## 1. Architecture Overview

### Component Hierarchy

```
RootLayout (app/layout.tsx)
├── ThemeProvider
├── AppShell
│   ├── LandingLayout (/, /privacy-policy, /terms-of-use, /contact)
│   │   ├── Header (mobile only, hamburger + theme)
│   │   ├── LandingModulesNavbar
│   │   └── Footer (landing-footer.tsx)
│   └── AppLayout (other routes)
│       ├── Sidebar (with LEGAL_LINKS section)
│       └── Main content
```

---

## 2. File Structure

```
app/
├── privacy-policy/
│   └── page.tsx
├── terms-of-use/
│   └── page.tsx
├── contact/
│   └── page.tsx
└── page.tsx (updated with footer)

src/components/
├── legal/
│   └── legal-page.tsx (shared layout component)
├── landing/
│   └── landing-footer.tsx (new footer component)
└── navigation/
    ├── app-shell.tsx (updated logic)
    └── sidebar.tsx (updated with LEGAL_LINKS)
```

---

## 3. Component Specifications

### 3.1 `LegalPage` Component

**File:** `src/components/legal/legal-page.tsx`

**Props:**

```typescript
interface LegalPageProps {
  eyebrow?: string; // Subtitle label, default: "Legal Document"
  title: string; // Main heading (h1)
  updatedAt: string; // Update date string
  children: React.ReactNode; // Content markup
}
```

**Structure:**

```tsx
<main>
  <header>
    <Link>Back to home</Link>
    <div>
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <p>Last updated: {updatedAt}</p>
    </div>
  </header>
  <div className="[&_h2]:mt-8 [&_ul]:space-y-2">{children}</div>
</main>
```

**Styling:**

- Max-width: 4xl (56rem)
- Padding: px-4 py-10 (mobile), px-8 py-14 (desktop)
- Header border-bottom, spacing adjustments
- Content typography via Tailwind prose-like classes

**Responsibilities:**

- Consistent layout for all legal pages
- Back navigation to home
- SEO-friendly metadata container
- Auto-styling of h2, li, ul

---

### 3.2 `LandingFooter` Component

**File:** `src/components/landing/landing-footer.tsx`

**Props:** None (standalone)

**Structure:**

```tsx
<footer className="border-t pt-6 text-sm text-muted-foreground">
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div className="flex flex-col gap-2">
      <p>Verify Docs</p>
      <p>
        <Link href="https://dswebdev.com.br/">DS Web Dev</Link> © 2026
      </p>
    </div>
    <div className="flex flex-wrap gap-4">
      <Link href="/privacy-policy">Privacy Policy</Link>
      <Link href="/terms-of-use">Terms of Use</Link>
      <Link href="/contact">Contact</Link>
    </div>
  </div>
</footer>
```

**Styling:**

- Top border for separation
- Responsive: column on mobile, row on desktop
- Links have hover transitions
- Text color: muted-foreground, hover: foreground

**Placement:**

- Rendered in `app/page.tsx` at end of main content
- Not in layout to avoid duplication across pages

---

### 3.3 Privacy Policy Page

**File:** `app/privacy-policy/page.tsx`

**Metadata:**

```typescript
export const metadata: Metadata = {
  title: "Privacy Policy | Verify Docs",
  description:
    "Privacy policy of Verify Docs regarding verification, processing and storage of PDF files.",
};
```

**Content Sections (12):**

1. Scope and Application
2. Categories of Data Processed
3. Purposes of Processing
4. Processing, Storage and Retention of PDFs
5. Legal Bases
6. Sharing and Processing Operators
7. Retention, Blocking and Deletion
8. Information Security
9. Data Subject Rights
10. User Responsibilities
11. Policy Changes
12. Contact Channel

**Features:**

- Structured h2 headings
- Bulleted lists for categories
- Paragraphs with legal language
- Email contact: suportedouglaspostopratico@gmail.com

---

### 3.4 Terms of Use Page

**File:** `app/terms-of-use/page.tsx`

**Metadata:**

```typescript
export const metadata: Metadata = {
  title: "Terms of Use | Verify Docs",
  description:
    "Terms of use of Verify Docs for using the platform for verification and storage of PDF files.",
};
```

**Content Sections (12):**

1. Subject Matter and Scope
2. Acceptance
3. Conditions of Use and User Declarations
4. Responsibility for Submitted Content
5. Availability, Performance and Limitations
6. Suspension and Blocking
7. Intellectual Property
8. Privacy and Data Protection
9. Limitation of Liability
10. Changes to Terms
11. Contact Channel
12. Applicable Law

**Features:**

- Clear user conduct expectations
- Liability limitations
- IP and platform ownership
- PDF handling responsibilities

---

### 3.5 Contact Page

**File:** `app/contact/page.tsx`

**Metadata:**

```typescript
export const metadata: Metadata = {
  title: "Contact | Verify Docs",
  description:
    "Official contact channel of Verify Docs for support, privacy, and requests related to PDF document processing.",
};
```

**Content Sections (3):**

1. Contact Email
2. Channel Purposes
3. Best Practices When Contacting

**Features:**

- Email link as `<a href="mailto:...">`
- Eyebrow label: "Official Channel"
- Bulleted purposes list
- Guidance on effective communication

---

### 3.6 AppShell Navigation Logic

**File:** `src/components/navigation/app-shell.tsx`

**Changes:**

**Before:**

```typescript
const isLandingPage = pathname === "/";
```

**After:**

```typescript
const isLegalPage = [
  "/",
  "/terms-of-use",
  "/privacy-policy",
  "/contact",
].includes(pathname);
const isLandingPage = isLegalPage;
```

**Behavior:**

- `isLandingPage` evaluates to true for 4 routes
- All 4 routes render landing layout (no sidebar, mobile hamburger menu)
- Other routes render app layout (sidebar visible)

**Layout (No Sidebar):**

- Mobile header: BrandLogo, ThemeSwitcher, HamburgerTrigger
- Desktop: ThemeSwitcher positioned absolute top-right
- Mobile hamburger opens sidebar in modal overlay
- Main content full width

---

### 3.7 Sidebar Legal Section

**File:** `src/components/navigation/sidebar.tsx`

**New Constant:**

```typescript
const LEGAL_LINKS = [
  {
    href: "/privacy-policy",
    icon: Shield,
    label: "Privacy Policy",
  },
  {
    href: "/terms-of-use",
    icon: FileText,
    label: "Terms of Use",
  },
  {
    href: "/contact",
    icon: Mail,
    label: "Contact",
  },
] as const;
```

**Rendering Logic:**

- After NAVIGATION_LINKS loop
- Border-top separator
- "Legal" uppercase label
- Map LEGAL_LINKS with active state highlighting
- Same styling as app links (rounded-2xl, border, hover effects)

**Icons:**

- Shield (Privacy Policy)
- FileText (Terms of Use)
- Mail (Contact)

---

## 4. Routing & Pages

### Public Routes

| Route             | Component         | Sidebar | Header                     |
| ----------------- | ----------------- | ------- | -------------------------- |
| `/`               | HomePage          | None    | Landing (mobile hamburger) |
| `/privacy-policy` | PrivacyPolicyPage | None    | Landing (mobile hamburger) |
| `/terms-of-use`   | TermsOfUsePage    | None    | Landing (mobile hamburger) |
| `/contact`        | ContactPage       | None    | Landing (mobile hamburger) |
| `/filter-by-cpf`  | FilterByCpfPage   | Yes     | App nav                    |
| (other app pages) | \*                | Yes     | App nav                    |

---

## 5. Styling & Tailwind Classes

### Footer

```
border-t pt-6 text-sm text-muted-foreground
flex flex-col gap-3 md:flex-row md:items-center md:justify-between
transition-colors hover:text-foreground
```

### Legal Page Container

```
mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 md:px-8 md:py-14
```

### Sidebar Legal Links

```
flex items-center rounded-2xl border px-3 py-3 text-sm transition-colors
border-primary/30 bg-primary/10 text-primary (active)
border-transparent hover:border-border hover:bg-muted/60 (hover)
focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-2
```

---

## 6. Data Flow

### Route Access Flow

```
User navigates to /privacy-policy
  ↓
Next.js Router matches app/privacy-policy/page.tsx
  ↓
PrivacyPolicyPage exported as default
  ↓
AppShell detects pathname in legal routes
  ↓
isLandingPage = true
  ↓
Render landing layout (no sidebar, mobile header)
  ↓
LandingModulesNavbar hidden on md breakpoint
  ↓
LegalPage component wraps content
  ↓
Render back link, title, sections
  ↓
Footer with legal links
```

### Sidebar Active State Flow

```
User on /terms-of-use
  ↓
usePathname() returns '/terms-of-use'
  ↓
Sidebar renders LEGAL_LINKS
  ↓
Each link compared: link.href === pathname
  ↓
Match found for /terms-of-use
  ↓
isActive = true
  ↓
Apply active styling (border-primary/30, bg-primary/10, text-primary)
```

---

## 7. Metadata & SEO

### Privacy Policy Metadata

```typescript
export const metadata: Metadata = {
  title: "Privacy Policy | Verify Docs",
  description:
    "Privacy policy of Verify Docs regarding verification, processing and storage of PDF files.",
};
```

### Terms of Use Metadata

```typescript
export const metadata: Metadata = {
  title: "Terms of Use | Verify Docs",
  description:
    "Terms of use of Verify Docs for using the platform for verification and storage of PDF files.",
};
```

### Contact Metadata

```typescript
export const metadata: Metadata = {
  title: "Contact | Verify Docs",
  description:
    "Official contact channel of Verify Docs for support, privacy, and requests related to PDF document processing.",
};
```

---

## 8. Responsive Behavior

### Mobile (< md breakpoint)

- Footer: vertical stack (flex-col)
- Sidebar: modal overlay triggered by hamburger
- Legal pages: full-width content
- Header: hamburger trigger visible
- Landing navbar: hidden

### Desktop (≥ md breakpoint)

- Sidebar: 320px fixed, always visible (on app pages)
- Footer: horizontal row (flex-row)
- Legal pages: no sidebar, centered content
- Header: hamburger hidden
- Landing navbar: visible, sticky

---

## 9. Accessibility

### WCAG Compliance

- Semantic HTML: `<main>`, `<nav>`, `<footer>`, `<h1>`, `<h2>`
- Links have text labels and hover states
- Color contrast: muted-foreground on background meets WCAG AA
- Focus-visible rings on interactive elements
- Landmark regions: main, nav, footer
- List structure: `<ul>`, `<li>` for bullet points

### Keyboard Navigation

- Tab order: links, buttons accessible
- Enter key activates links
- Focus styles visible (ring-ring/60)
- Escape closes mobile sidebar

### Screen Readers

- Link text describes destination ("Privacy Policy", "Terms of Use")
- Headings hierarchical (h1 → h2)
- Lists marked as `<ul>` for screen reader context

---

## 10. Performance Considerations

### Bundle Size

- LegalPage: ~200 bytes (shared component)
- LandingFooter: ~150 bytes
- Each legal page: ~2-3 KB (HTML content)
- Total impact: minimal

### Code Splitting

- Legal pages server-rendered
- No dynamic imports needed
- Next.js automatic route-based code splitting

### Caching

- Legal pages marked static (no revalidate needed)
- CSS classes Tailwind-compiled (tree-shaken)
- Metadata generated at build time

---

## 11. Testing Strategy

### Unit Tests

- LegalPage component renders title, eyebrow, children
- LandingFooter renders links and branding
- Sidebar LEGAL_LINKS array structure valid

### Integration Tests

- Navigate to /privacy-policy, /terms-of-use, /contact
- Verify sidebar not displayed
- Verify mobile hamburger triggers sidebar
- Click legal links, navigate successfully

### E2E Tests

- User flow: landing → privacy policy → terms → contact
- Active state highlighting in sidebar
- Footer branding link redirects to external URL
- Email mailto link opens mail client (manual test)

### Accessibility Tests

- axe DevTools on all legal pages
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader testing (NVDA, VoiceOver)

---

## 12. Error Handling

### 404 Routes

- Old Portuguese routes (politica-de-privacidade, termos-de-uso, contato) redirected or return 404
- Monitor server logs for 404 errors
- Consider server-side redirects if SEO priority

### Link Failures

- All internal links use Next.js `Link` (client-side prefetch)
- External link (DS Web Dev) uses standard `<a>` with target="\_blank" (optional)
- Email mailto verified for format

---

## 13. Deployment Checklist

- [ ] All routes deployed and accessible
- [ ] Metadata (title, description) rendering in HTML
- [ ] No hydration errors or console warnings
- [ ] Sidebar hidden on legal pages (verified on mobile/desktop)
- [ ] Footer visible on landing page
- [ ] DS Web Dev link opens correct URL
- [ ] Email link in contact page formatted correctly
- [ ] Responsive layout tested on mobile/tablet/desktop
- [ ] Active route highlighting works in sidebar
- [ ] Performance: legal pages < 1s load time
- [ ] SEO: metadata present for share preview

---

## 14. Dependencies

| Package      | Version | Purpose                        |
| ------------ | ------- | ------------------------------ |
| next         | 16.2.4  | App Router, Metadata API       |
| react        | 19.2.4  | JSX rendering                  |
| tailwindcss  | 4       | CSS utility classes            |
| lucide-react | 1.14.0  | Icons (Shield, FileText, Mail) |

---

## 15. Known Issues & Limitations

1. **No Multi-language:** English only; Portuguese removed
2. **Static Email:** suportedouglaspostopratico@gmail.com not validated/monitored
3. **No Form Submission:** Contact page is informational only
4. **No Legal Review:** Content follows LGPD principles but not reviewed by counsel
5. **Old Route Redirects:** No 301 redirects from Portuguese routes
6. **Cookie Policy:** Not included; separate implementation needed

---

## 16. Future Improvements

1. Automated privacy policy updates from configuration
2. Multi-language support with i18n
3. Contact form with email backend
4. Legal document versioning/history
5. Cookie consent banner integration
6. GDPR/CCPA specific versions
7. Audit log for policy changes

---

## 17. Support & Maintenance

### Monitoring

- Server logs for 404s on legal pages
- Core Web Vitals for performance
- Email deliverability (suportedouglaspostopratico@gmail.com)

### Updates

- Quarterly review of privacy/terms language
- Update dates when policy changes
- Test links annually

### Contact

- Issues: Internal team
- Legal questions: External counsel (if applicable)

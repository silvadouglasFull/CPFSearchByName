# Legal Pages & Footer Implementation - PRD

**Version:** 1.0  
**Status:** Completed  
**Date:** May 8, 2026  
**Author:** Douglas

---

## Executive Summary

Implementation of legal compliance pages (Privacy Policy, Terms of Use, Contact) and footer branding for the Verify Docs application. These pages establish legal frameworks for PDF processing, data handling, and user responsibilities in full English (USA) to align with the application's internationalization.

---

## Background & Motivation

Verify Docs is a platform for PDF verification, processing, and storage. The application requires:

1. **Privacy Policy** — compliance with data protection standards (LGPD, GDPR principles)
2. **Terms of Use** — establish boundaries and user responsibilities
3. **Contact Channel** — official support and LGPD exercise endpoint
4. **Brand Attribution** — footer credit to DS Web Dev

---

## Objectives

- [ ] Provide transparent privacy and usage policies in English
- [ ] Establish clear data handling practices for PDF storage and processing
- [ ] Create centralized contact point for user inquiries and data subject requests
- [ ] Integrate legal links into app navigation (sidebar & footer)
- [ ] Maintain consistent visual identity with DS Web Dev branding
- [ ] Remove sidebar navigation from legal/landing pages for distraction-free reading

---

## Scope

### Included

1. Three legal pages: Privacy Policy, Terms of Use, Contact
2. Routes: `/privacy-policy`, `/terms-of-use`, `/contact`
3. Footer component on landing page with legal links + DS Web Dev attribution
4. Legal links section in app sidebar
5. Hide sidebar on legal pages and landing page
6. Shared `LegalPage` layout component
7. Full English (USA) content with LGPD/legal rigor

### Not Included

- Cookie policy or GDPR cookie consent banner
- Multi-language support (English only)
- Legal review by external counsel
- Automated privacy policy generation tools
- Cookie or analytics tracking implementations

---

## User Stories

### Story 1: User reads Privacy Policy
**As a** user concerned about data protection  
**I want to** access a comprehensive privacy policy  
**So that** I understand how my data and PDF files are processed, stored, and protected

**Acceptance Criteria:**
- Privacy Policy is accessible via link in footer and sidebar
- Contains sections on data categories, purposes, retention, sharing, and security
- Includes contact information for data subject requests
- No sidebar distraction

### Story 2: User reviews Terms of Use
**As a** user before uploading sensitive documents  
**I want to** review terms that govern platform usage  
**So that** I understand my responsibilities, limitations, and platform liability

**Acceptance Criteria:**
- Terms are clear and cover: user conduct, content responsibility, availability, suspension, IP, liability
- Link available in footer and sidebar
- Full English text with legal language
- No sidebar distraction

### Story 3: User contacts platform for support or LGPD request
**As a** user needing assistance or exercising data rights  
**I want to** find an official contact channel  
**So that** I can submit inquiries and LGPD data subject requests

**Acceptance Criteria:**
- Contact page lists official email: suportedouglaspostopratico@gmail.com
- Includes purposes: support, privacy questions, LGPD exercises
- Best practices for contacting (objective, concise)
- Link in footer and sidebar

### Story 4: User sees DS Web Dev attribution
**As a** visitor on the landing page  
**I want to** see DS Web Dev branding  
**So that** I know who developed this platform

**Acceptance Criteria:**
- Footer shows "DS Web Dev © 2026"
- "DS Web Dev" is a clickable link to https://dswebdev.com.br/
- Positioned in left column of footer
- Visual hierarchy maintained

---

## Functional Requirements

### FR1: Privacy Policy Page
- Route: `/privacy-policy`
- 12 sections covering LGPD/international data protection standards
- Sections: Scope, Data Categories, Purposes, PDF Processing, Legal Bases, Sharing, Retention, Security, Rights, Responsibilities, Changes, Contact
- Metadata: Title, description for SEO
- No sidebar display
- Shared layout component with customizable eyebrow text
- Email contact: suportedouglaspostopratico@gmail.com

### FR2: Terms of Use Page
- Route: `/terms-of-use`
- 12 sections covering user conduct, content, availability, liability
- Sections: Subject Matter, Acceptance, Conditions, Content Responsibility, Availability, Suspension, IP, Privacy Integration, Liability, Changes, Contact, Applicable Law
- Metadata: Title, description for SEO
- No sidebar display
- Shared layout component
- Email contact: suportedouglaspostopratico@gmail.com

### FR3: Contact Page
- Route: `/contact`
- Purpose: official channel for support, privacy, LGPD requests
- Sections: Email Contact, Channel Purposes, Best Practices
- Email link: suportedouglaspostopratico@gmail.com (mailto)
- Eyebrow label: "Official Channel"
- No sidebar display
- Accessible from footer and sidebar

### FR4: Landing Footer
- Display on `/` route
- Left column: "Verify Docs" + "DS Web Dev © 2026" (DS Web Dev is link)
- Right column: Privacy Policy, Terms of Use, Contact links
- Responsive: stacked on mobile, row on desktop
- Style: muted-foreground text, hover underline transition

### FR5: Sidebar Legal Section
- Display on app pages (not on legal pages or landing)
- Labeled "Legal" section with uppercase label
- Three links: Privacy Policy, Terms of Use, Contact
- Icons: Shield, FileText, Mail (from lucide-react)
- Active state styling matches other sidebar links
- Separated by border-top and padding

### FR6: AppShell Logic
- No sidebar for: `/`, `/privacy-policy`, `/terms-of-use`, `/contact`
- Sidebar visible for all other routes
- Landing layout (centered ThemeSwitcher, hamburger) applies to all legal pages

---

## Non-Functional Requirements

### NFR1: Performance
- Legal pages load in < 1s
- Footer renders without CLS (Cumulative Layout Shift)

### NFR2: Accessibility
- All headings use semantic h2 tags
- Links have underline-offset-4 and hover state
- Color contrast meets WCAG AA standards
- Metadata (title, description) present for SEO

### NFR3: Maintainability
- Shared `LegalPage` component reduces duplication
- Content organized by route folder structure
- Consistent styling via Tailwind + shadcn components

### NFR4: Legal Compliance
- Content addresses LGPD data subject rights
- Terms acknowledge third-party integrations and limitations
- Privacy policy explicitly covers PDF processing and storage

---

## Data Model

### LegalPageProps (Shared Component)
```typescript
interface LegalPageProps {
  eyebrow?: string;           // Default: "Legal Document"
  title: string;              // Page title (h1)
  updatedAt: string;          // Last update date
  children: React.ReactNode;  // HTML content
}
```

### LEGAL_LINKS (Sidebar Array)
```typescript
const LEGAL_LINKS = [
  { href: '/privacy-policy', icon: Shield, label: 'Privacy Policy' },
  { href: '/terms-of-use', icon: FileText, label: 'Terms of Use' },
  { href: '/contact', icon: Mail, label: 'Contact' },
]
```

---

## Route Structure

```
app/
├── privacy-policy/
│   └── page.tsx          // Privacy Policy page
├── terms-of-use/
│   └── page.tsx          // Terms of Use page
├── contact/
│   └── page.tsx          // Contact page
└── page.tsx              // Landing with updated footer

src/components/
├── legal/
│   └── legal-page.tsx    // Shared layout component
└── landing/
    └── landing-footer.tsx // Footer component
```

---

## Implementation Details

### Legal Content Language
- **Language:** English (USA)
- **Legal Tone:** Formal, compliance-focused
- **LGPD Alignment:** Sections on data subject rights, retention, bases, sharing
- **PDF Processing:** Explicit mentions of PDF storage, reprocessing, auditoria

### UI/UX
- **Layout:** Max-width 4xl, centered, responsive padding
- **Footer:** Back link to `/`, eyebrow label, title, update date
- **Navigation:** Footer + sidebar links; no sidebar on legal pages
- **Typography:** Semantic headings, ul/li for lists, links with hover states

### Component Reuse
- `LegalPage` wrapper handles: layout, header, footer structure, styling
- Sidebar `LEGAL_LINKS` constant; reuse in both sidebar and footer
- `Link` from Next.js for client-side navigation
- `Metadata` for SEO titles/descriptions

---

## Testing Checklist

- [ ] Privacy Policy page loads at `/privacy-policy`
- [ ] Terms of Use page loads at `/terms-of-use`
- [ ] Contact page loads at `/contact`
- [ ] Sidebar is hidden on legal pages
- [ ] Sidebar is hidden on landing page (`/`)
- [ ] Sidebar displays on app pages (e.g., `/filter-by-cpf`)
- [ ] Footer appears on landing page with legal links
- [ ] "DS Web Dev © 2026" link navigates to https://dswebdev.com.br/
- [ ] All links in footer and sidebar are functional
- [ ] Email link in contact page is `mailto:` clickable
- [ ] Active route highlighting works in sidebar legal section
- [ ] Responsive layout on mobile (footer stacks, hamburger visible)
- [ ] Metadata (title, description) correct for each page
- [ ] No console errors or hydration mismatches
- [ ] TypeScript compilation without errors

---

## Success Metrics

- [ ] All three legal pages deployed and accessible
- [ ] No broken links to legal pages
- [ ] User can reach contact email from three entry points (footer, sidebar, page content)
- [ ] Sidebar legal section renders correctly with icons
- [ ] DS Web Dev branding visible and linked

---

## Dependencies

- `next` 16.2.4 — App Router, Metadata API
- `react` 19.2.4 — JSX, hooks
- `tailwindcss` 4 — Styling
- `shadcn/ui` — Badge, Button, Card, DropdownMenu
- `lucide-react` 1.14.0 — Icons (Shield, FileText, Mail)
- `next/link` — Client navigation

---

## Known Limitations

1. No multi-language support (English only)
2. No automated privacy policy updates
3. No cookie consent banner (separate implementation)
4. Contact email is static; no form submission backend
5. Legal review by external counsel not included
6. LGPD applies primarily to Brazil; GDPR and other jurisdictions may require adjustment

---

## Future Enhancements

1. Cookie policy page and consent banner
2. Multi-language support (Portuguese, Spanish)
3. Contact form with backend submission
4. Privacy policy generator from configuration
5. Audit log for policy updates
6. A/B testing on legal page layout
7. Legal document versioning system

---

## Deployment Notes

- Ensure all routes are publicly accessible (no auth guards)
- Monitor 404 errors for old Portuguese routes (politica-de-privacidade, termos-de-uso, contato)
- Verify email link in contact page sends to correct inbox
- Check metadata (og:title, og:description) for social sharing
- Monitor Core Web Vitals for legal pages

---

## Stakeholders

- **Product:** Douglas (owner)
- **Engineering:** Implementation team
- **Legal:** External counsel (if applicable)
- **Support:** suportedouglaspostopratico@gmail.com

---

## Sign-Off

- [ ] PRD approved
- [ ] Implementation complete
- [ ] Testing passed
- [ ] Deployed to production

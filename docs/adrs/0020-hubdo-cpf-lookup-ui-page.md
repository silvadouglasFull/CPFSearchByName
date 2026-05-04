# ADR 0020 - HubDo CPF Lookup UI Page with Search and History

## Status

Proposed

## Context

The HubDo CPF WebService integration (ADR 0019) provides API endpoints for official CPF validation via Receita Federal. Users currently have no interface to perform CPF lookups or view results.

A new UI page is required to:
- Allow users to search CPF with optional birth date
- Display official person data from Receita Federal
- Show credit consumption transparency
- Maintain lookup history with pagination
- Handle query modes (normal/turbo) based on urgency
- Provide clear feedback on success, validation errors, and service failures

## Decision

1. **Page Architecture**

   - New page: `app/hubdo-cpf-lookup/page.tsx`
   - Client component: `src/components/hubdo-cpf-lookup/hubdo-cpf-lookup-client.tsx`
   - Reusable subcomponents for search form, result display, history list
   - Tab-based UI: Search + History (following established patterns from filter-by-cpf)

2. **UI Structure**

   - **Search Tab:**
     - Input fields: CPF, Birth Date
     - Query mode selector: Normal (5 credits) vs Turbo (25 credits)
     - Search button with loading state
     - Result card displaying official person data
     - Credit consumption feedback

   - **History Tab:**
     - Paginated list of previous lookups
     - Filter options: by CPF, date range
     - Collapsible details per lookup
     - Quick re-search action

3. **Data Flow**

   - Frontend form validates CPF format and optional birth date
   - User clicks search → POST request to `/api/hubdo-cpf-lookup`
   - Loading state shown during request (max 30s turbo, 600s normal)
   - On success: Display person data with success badge
   - On error: Show error message with suggested action (retry, check format, etc.)
   - Auto-fetch history after successful lookup

4. **State Management**

   - Local React state for form inputs, loading, errors
   - `FriendlyMessage` component for user feedback
   - Tab state for switching between search and history
   - Pagination state for history listing

5. **Error Handling UI**

   - Validation errors: Inline error messages under form fields
   - Token/IP errors: Alert banner suggesting admin contact
   - Timeout: Suggest retry with turbo mode
   - Service unavailable: Suggest retry later

6. **Accessibility**

   - Form labels and semantic HTML
   - Error announcements via aria-live regions
   - Keyboard navigation (Tab, Enter)
   - WCAG 2.1 AA compliance

## Consequences

**Positive:**
- Users gain self-service CPF validation capability
- Transparent credit consumption tracking
- Integration with existing UI patterns (tabs, history)
- Audit trail automatically captured in database

**Negative:**
- Adds complexity to project scope
- Requires coordination with credit management (monitoring, alerts)
- Performance depends on HubDo service availability

**Mitigation:**
- Use pessimistic timeout handling (show spinner, disable button)
- Pre-calculate credit cost before query (display in UI)
- Implement admin dashboard for credit balance monitoring
- Rate-limit per-user to prevent credit depletion

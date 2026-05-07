# Functional Specification - HubDo CPF Lookup UI Page

## Objective

Provide users with a self-service interface to perform official CPF lookups via Receita Federal through HubDo WebService, displaying person data and maintaining searchable history.

## Scope

- Dedicated page for CPF lookups (`app/hubdo-cpf-lookup/page.tsx`)
- Tabbed interface: Search and History tabs
- CPF validation and person data display
- Lookup history with pagination and filtering
- Credit consumption transparency
- Error handling and user feedback

## User Journeys

### Journey 1: Perform CPF Lookup

1. User navigates to HubDo CPF Lookup page
2. User enters CPF (formatted or unformatted)
3. User optionally enters birth date (DD/MM/YYYY)
4. User selects query mode:
   - **Normal**: 5 credits, ~10 min timeout
   - **Turbo**: 25 credits, 30s timeout
5. User clicks "Buscar CPF"
6. System shows loading spinner (max time depends on mode)
7. On success:
   - Display person data card with:
     - Full name
     - Birth date
     - Cadastral status (REGULAR/SUSPENDED/INACTIVE)
     - Registration date
     - Check digit
     - Proof code and date
     - "From [origin]" badge (database/Receita Federal/turbo)
   - Show credits consumed
   - Auto-fetch history

8. On error:
   - Display error message card with:
     - Error code
     - User-friendly explanation
     - Suggested action (retry, check format, try turbo, etc.)

### Journey 2: View Lookup History

1. User switches to "Histórico" tab
2. System fetches paginated list of user's previous lookups
3. User sees table/list with columns:
   - CPF (formatted)
   - Status (OK/NOK)
   - Cadastral Status (when OK)
   - Query Mode
   - Credits Used
   - Date/Time
   - Actions (View Details, Re-search)

4. User can:
   - Click "Ver Detalhes" to expand full response
   - Click "Re-search" to populate search form with CPF
   - Navigate pages (Previous/Next)

### Journey 3: Filter History

1. User in History tab
2. User enters search text in filter field
3. System filters results by CPF containing text
4. Results update without page reload

## Inputs

### Search Form

- `cpf`: Text input (accepts formatted/unformatted)
- `birthDate`: Optional date input or text (DD/MM/YYYY)
- `mode`: Radio buttons (normal/turbo)

### History Filter

- `filterText`: CPF or date range filter

### Pagination

- `page`: Current page (default 1)
- `pageSize`: Items per page (default 10, max 50)

## Outputs

### Search Result

- Person data card (on success)
- Error card (on failure)
- Credits consumed badge

### History Listing

- Paginated table of lookups
- Expandable detail rows
- Pagination controls

## Business Rules

1. **CPF Validation**
   - Accept formatted (XXX.XXX.XXX-XX) or unformatted (11 digits)
   - Display formatted in results

2. **Birth Date**
   - Optional for database lookups
   - Required for online Receita Federal queries
   - Format: DD/MM/YYYY

3. **Query Mode Selection**
   - Normal: Cheaper (5 credits), slower (up to 600s)
   - Turbo: Expensive (25 credits), faster (30s)
   - Suggest turbo if initial query times out

4. **Credit Display**
   - Show estimated cost before search
   - Display actual cost used after search
   - Show running total for user (future: implement credit balance tracking)

5. **History Persistence**
   - All lookups automatically saved to database
   - No manual save action required (auto-persist via API)
   - History accessible immediately after search

6. **Error Scenarios**
   - **Validation Error**: Show inline feedback, allow retry
   - **CPF Not Found**: Clear message, no retry needed
   - **Token Invalid/IP Error**: Admin alert, disable lookup temporarily
   - **Timeout**: Suggest turbo mode retry
   - **Service Unavailable**: Suggest retry later

## Non-Functional Requirements

- **Performance**: Search button responsive in <500ms, results in ≤600s (normal) or ≤30s (turbo)
- **Responsiveness**: Mobile-first design, works on screens 320px+ wide
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigable
- **Reliability**: Graceful handling of network errors and service timeouts
- **Feedback**: Loading states, error messages, success confirmations

## Acceptance Criteria

1. ✅ Page rendered at `/hubdo-cpf-lookup` route
2. ✅ Search form accepts CPF and optional birth date
3. ✅ Query mode selector (normal/turbo) functional
4. ✅ API endpoint called with correct parameters
5. ✅ Success result displays all person data fields
6. ✅ Error messages display user-friendly explanations
7. ✅ History tab shows paginated lookup list
8. ✅ History auto-populated after successful search
9. ✅ Pagination controls work correctly
10. ✅ Loading states shown during API calls
11. ✅ Credit consumption displayed transparently
12. ✅ Mobile responsive layout works
13. ✅ Keyboard navigation works
14. ✅ Tab switching between Search and History works

## Requirement Traceability

1. Page component
   - `app/hubdo-cpf-lookup/page.tsx`

2. Client component
   - `src/components/hubdo-cpf-lookup/hubdo-cpf-lookup-client.tsx`

3. Subcomponents
   - `src/components/hubdo-cpf-lookup/hubdo-cpf-search-form.tsx`
   - `src/components/hubdo-cpf-lookup/hubdo-cpf-result-card.tsx`
   - `src/components/hubdo-cpf-lookup/hubdo-cpf-history-table.tsx`

4. Types
   - `src/components/hubdo-cpf-lookup/types.ts`

5. API Integration
   - `GET /api/hubdo-cpf-lookup` (existing)
   - New query: `GET /api/hubdo-cpf-lookups-history?page=1&pageSize=10` (for history listing)

6. Shared Components
   - `FriendlyMessage` (feedback)
   - `Button` (actions)
   - `Input` (forms)
   - `Card` (layout)

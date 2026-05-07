# HubDo Bulk Lookup Find-Match - Functional Specification

**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-05-07

## 1. Overview

This feature allows users to perform bulk CPF lookups that **stop processing as soon as a matching person name is found**. Unlike the standard bulk lookup that processes all CPFs and persists name matches/exclusions for later reuse, this flow is optimized for users who only need to find **one match** and don't care about the rest.

## 2. Problem Statement

- Current bulk lookup processes **all** CPFs in the queue regardless of matches
- Users may want to search for a specific person and stop as soon as they find them
- Processing all 10,000 CPFs when only 1 is needed wastes resources and time
- Need user control: "stop on match" vs "process all"

## 3. User Stories

### US-1: Choose Search Mode

**As a** user queuing CPFs for bulk lookup  
**I want to** choose between two search modes:

1. **Search All** (default): Process all CPFs, persist matches/exclusions
2. **Find Match** (new): Stop when first match found

**Acceptance Criteria:**

- Modal shows radio buttons or dropdown: "Search all CPFs" / "Stop when name matches"
- Selecting "Stop when name matches" requires a `targetName`
- When user selects "Find Match" mode, they're enqueued in a different flow

### US-2: Stop Processing on Match

**As a** system processing a find-match bulk job  
**I want to** immediately stop queueing remaining CPFs once a name match is found  
**So that** we save resources and return results faster

**Acceptance Criteria:**

- When a CPF's name matches the target name (normalized), mark job as `found`
- Emit realtime event: `job:found` with CPF, name, birthDate
- Remaining queued items are marked as `skipped` (not `error`)
- Job status: `found` (not `completed`)

### US-3: Realtime Notification

**As a** user watching a find-match job  
**I want to** see the matching CPF details immediately when found  
**So that** I know the job succeeded

**Acceptance Criteria:**

- Frontend receives realtime `job:found` event via Socket.io
- Display: "✅ Found! CPF: XXX | Name: YYY | Birth Date: ZZ/ZZ/ZZZZ"
- Modal shows the matching record with option to link it or export

## 4. Flow

### 4.1 Enqueue Find-Match Job

```
User selects CPFs → "Queue selected CPFs"
  → Modal: "Choose search mode"
    ✓ Search all CPFs (with targetName)
    ✓ Stop when name matches (requires targetName) [NEW]
  → User picks "Stop when name matches" + enters "João Silva"
  → POST /api/hubdo-cpf-lookup/bulk-find-match
     { cpfs: [...], mode: 'normal'|'turbo', targetName: 'João Silva' }
  → Job created with status: 'queued'
  → CPFs enqueued to RabbitMQ queue: `hubdo_bulk_lookup_find_match_queue`
```

### 4.2 Consumer Processing

```
1. Consume message from find_match queue
2. Lookup CPF via HubDo API
3. If success:
   a. Extract name from response
   b. Normalize both names (target + found)
   c. Compare: if names match:
      ✅ Mark job as 'found'
      ✅ Record found CPF + name + birthDate in job
      ✅ Mark ALL remaining items as 'skipped'
      ✅ Emit realtime event: 'job:found'
      ✅ STOP processing other items
   d. If no match:
      ✅ Record as exclusion (for potential reuse)
      ✅ Continue to next CPF
4. If error:
   ✅ Retry logic (same as standard bulk)
   ✅ If max retries → mark as 'error'
   ✅ Continue to next CPF
```

### 4.3 State Transitions

```
Job States:
  queued         → (consumer picks up items)
    ↓
  processing     → (first item being looked up)
    ├─ found      → (name matched, STOP!) ✅
    ├─ completed  → (all items processed, no match found)
    └─ failed     → (retries exhausted)

Item States:
  queued         → processing → success
  queued         → processing → error/dead_letter
  queued         → skipped (when job:found fired, rest are skipped)
```

## 5. Database Changes

New columns in `hubdo_bulk_lookup_jobs`:

- `found_cpf` (text, nullable): CPF that matched
- `found_name` (text, nullable): Person name that matched
- `found_birth_date` (text, nullable): Birth date of matched person

Status enum extended:

- `queued` | `processing` | `found` | `completed` | `failed`

New queue in RabbitMQ:

- `hubdo_bulk_lookup_find_match_queue`

## 6. API Contracts

### Request

```http
POST /api/hubdo-cpf-lookup/bulk-find-match
Content-Type: application/json

{
  "cpfs": ["123.456.789-01", "987.654.321-00"],
  "mode": "normal",
  "targetName": "João Silva"
}
```

### Response (202 Accepted)

```json
{
  "jobId": "abc-123-def",
  "status": "queued",
  "summary": {
    "total": 2,
    "queued": 2,
    "processing": 0,
    "success": 0,
    "error": 0,
    "skipped": 0
  }
}
```

### Realtime Event (Socket.io)

```javascript
socket.on("hubdo:bulk:found", {
  jobId: "abc-123-def",
  foundCpf: "123.456.789-01",
  foundName: "JOÃO SILVA",
  foundBirthDate: "1990-05-10",
  timestamp: "2026-05-07T10:30:00Z",
});
```

## 7. User Interface Changes

### Modal Enhancement

```
┌─────────────────────────────────────┐
│ Confirm bulk queue                  │
├─────────────────────────────────────┤
│ Target person name                  │
│ [Input: "João Silva"]               │
│                                     │
│ Search mode:                        │
│ ◉ Process all CPFs (default)        │
│   Continues even after finding name │
│                                     │
│ ○ Stop when name matches (NEW)      │
│   Stops processing when found       │
│                                     │
│         [Cancel]  [Confirm & queue] │
└─────────────────────────────────────┘
```

### Results Display

```
When find-match succeeds:
┌──────────────────────────────────────┐
│ ✅ Found matching person!            │
├──────────────────────────────────────┤
│ CPF: 123.456.789-01                  │
│ Name: JOÃO SILVA                     │
│ Birth Date: 10/05/1990               │
│ Processed: 147 CPF(s) before match   │
│ Skipped: 3,853 CPF(s)                │
│         [Use this]  [Export]         │
└──────────────────────────────────────┘
```

## 8. Error Handling

- If `targetName` is empty in find-match mode → 400 error
- If max CPFs exceeded (100) → 400 error
- If job:found fires but consumer crashes → job stays in `processing`, realtime event resent on reconnect
- If all CPFs processed with no match → job transitions to `completed` (not `found`)

## 9. Non-Functional Requirements

- Find-match queue has dedicated consumer (separate from standard bulk)
- No name matches/exclusions persisted (faster, less DB writes)
- Realtime events emitted within 500ms of name match
- Skipped items do NOT call HubDo API (pure DB updates)

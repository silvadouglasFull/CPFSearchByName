# ADR 0032: Do Not Persist Name Exclusions in Find-Match Flow

**Status:** Accepted  
**Date:** 2026-05-07  
**Context:** Find-match bulk lookup searches for a single matching person name and stops. Unlike standard bulk, find-match has no concept of "reusing" the search results.

## Problem

Should find-match consumer persist name exclusion records (like standard bulk does) for potential reuse in future jobs?

## Options Considered

### Option A: Persist Exclusions ❌ REJECTED

Record all non-matching CPFs in `hubdo_bulk_lookup_name_exclusions` table (same as standard bulk).

**Pros:**

- Reusable dataset if user searches for same `targetName` again
- Consistent with standard bulk flow

**Cons:**

- Extra DB writes during find-match processing
- DB bloat: find-match jobs may have high CPF volumes, most unmarked
- Performance hit: INSERT for every non-match
- Complexity: Add "mode" or "find_match_flag" to exclusions table to differentiate
- Unclear value: User searching for same name is edge case; standard bulk already provides this optimization

### Option B: Do Not Persist Exclusions ✅ CHOSEN

Skip recording to `hubdo_bulk_lookup_name_exclusions` in find-match consumer. Only record the found match (in `found_cpf` field).

**Pros:**

- Faster consumer processing (fewer DB writes)
- Cleaner schema (no new fields needed)
- Reflects semantics: find-match is "search-once, stop", not "persistent dataset"
- Lower DB load
- Simpler consumer logic

**Cons:**

- If user runs same find-match again (same `targetName`), we re-process all CPFs
- No "exclusion reuse" optimization for find-match

## Decision

**Do not persist exclusions in find-match flow.**

### Rationale

1. **Semantics**: Find-match is a one-off search. Users typically don't repeat the same search unless they have a new batch of CPFs. Standard bulk is optimized for "search all names in dataset"; find-match is optimized for "find one person". These are different user journeys.

2. **Performance**: Fewer DB writes means faster consumer throughput. Find-match jobs can complete in seconds with 10,000+ CPFs if they match early.

3. **Schema Simplicity**: Don't need to add `find_match_flag` to `hubdo_bulk_lookup_name_exclusions` or create a separate exclusions table.

4. **Cost**: Lower database I/O, lower storage, lower query cost.

5. **Clarity**: Standard bulk `name_exclusions` table stays focused on "reusable results for repeated searches". Find-match is separate concern.

## Implementation

Find-match consumer:

```typescript
if (isMatch) {
  // Only record the found match
  await deps.bulkRepository.markFindMatchJobAsFound(
    jobId,
    cpf,
    name,
    birthDate,
  );
} else {
  // Skip recording exclusion
  // Continue to next CPF
}
```

## Future Considerations

If future requirements want "reusable" find-match results, we can:

1. Create separate `hubdo_bulk_lookup_find_match_exclusions` table, or
2. Add `find_match_mode` flag to `hubdo_bulk_lookup_name_exclusions` and filter on retrieval

For now, keep it simple.

## Related Decisions

- ADR 0031: Separate queue for find-match
- Spec: [HubDo Bulk Lookup Find-Match Technical Specification](../specs/hubdo-bulk-lookup-find-match-technical-spec.md)

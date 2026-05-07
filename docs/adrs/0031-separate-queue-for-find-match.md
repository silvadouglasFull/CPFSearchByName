# ADR 0031: Separate Queue for Find-Match Bulk Lookups

**Status:** Accepted  
**Date:** 2026-05-07  
**Context:** HubDo bulk CPF lookup feature supports two strategies:

1. **Search All**: Process all CPFs, persist match/exclusion records (current)
2. **Find Match**: Stop when first name match found (new feature)

## Problem

Should find-match jobs share the same RabbitMQ queue as standard bulk lookups or use a separate queue?

## Options Considered

### Option A: Shared Queue (Single Consumer)

Consumer checks `find_match_mode` flag on each job and applies different logic.

**Pros:**

- Simpler queue management
- One consumer codebase

**Cons:**

- Consumer logic becomes complex (if/else branches for two different flows)
- Standard bulk jobs might be delayed by find-match jobs (no priority)
- Harder to scale consumers independently
- Cache/state management for "found" status complicates shared consumer

### Option B: Separate Queues (Dedicated Consumer) ✅ CHOSEN

Find-match jobs go to `hubdo_bulk_lookup_find_match_queue` with dedicated consumer.

**Pros:**

- Clear separation of concerns
- Find-match consumer is optimized (no unnecessary DB queries for matches/exclusions)
- Independent scaling (spin up more find-match consumers if needed)
- Easier to monitor/debug (separate logs)
- Cache in consumer for "found" status works cleanly
- Standard bulk consumer unaffected by find-match logic

**Cons:**

- Two consumers to maintain
- Slight code duplication for retry/error handling
- Requires separate RabbitMQ queue

## Decision

**Separate queues with dedicated consumer.**

### Rationale

1. **Flow Semantics**: Find-match and search-all are fundamentally different operations (stop vs. continue). Separating them makes semantics explicit.

2. **Scalability**: Find-match jobs can complete faster (stop early), so they don't need the same throughput. Separate queue allows independent tuning.

3. **Maintainability**: Consumer logic is cleaner when not handling two flows simultaneously. Find-match consumer focuses on:
   - Looking up each CPF
   - Comparing names
   - Stopping when match found
   - Skipping remaining items

   Standard consumer still handles:
   - Looking up each CPF
   - Comparing names
   - Persisting matches/exclusions
   - Processing all items

4. **Monitoring**: Separate queue metrics (depth, throughput) make it easier to spot bottlenecks.

5. **Caching**: Job "found" status cache in consumer works cleanly without interfering with standard bulk processing.

## Implementation Details

- Queue name: `hubdo_bulk_lookup_find_match_queue`
- Prefetch: 10 (same as standard bulk)
- Consumer: `startHubdoBulkFindMatchConsumer()`
- Flag in DB: `find_match_mode: boolean` on `hubdo_bulk_lookup_jobs`
- Service method: `enqueueBulkJobFindMatch()` publishes to find-match queue

## Migration

Existing standard bulk jobs unaffected. New jobs can choose mode at enqueue time.

## Alternatives Considered But Rejected

1. **Priority Queue**: Use same queue but mark find-match as high priority. Rejected because not all find-match jobs should be higher priority than standard bulk jobs.

2. **Consumer Groups**: Use Kafka consumer groups. Rejected because we're already on RabbitMQ and it works well for this use case.

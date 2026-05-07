# ADR 0019 - HubDo CPF WebService Integration

## Status

Proposed

## Context

The current application collects CPF data from portal searches and file-based results. To enhance data accuracy and provide official Receita Federal validation, a more robust integration with an authoritative CPF source is needed.

HubDo offers a CPF WebService that:
- Validates CPF numbers against Receita Federal databases
- Provides official person data (name, birth date, registration status, etc.)
- Supports both cached lookups (1 credit) and real-time Receita Federal queries (5-25 credits)
- Offers "turbo" mode for urgent queries (30s timeout, 25 credits per query)
- Implements IP-based access control and token authentication

## Decision

1. **Integration Architecture**

   - Create new module `src/hubdoCpf/` following existing domain-driven design patterns
   - Domain layer: types, interfaces, error models
   - Application layer: service for orchestration and credit/timeout management
   - Infrastructure layer: HTTP client for HubDo API calls, credit calculator
   - API routes: `GET /api/hubdo-cpf-lookup` for frontend consumption

2. **Data Flow**

   - Accept CPF and optional birth date from frontend or internal flows
   - Normalize CPF input (remove formatting, validate digits)
   - Route to HubDo with appropriate mode (normal/turbo based on priority)
   - Handle token management and IP whitelisting via environment configuration
   - Cache successful responses to reduce credit consumption
   - Persist lookups to `hubdo_cpf_lookups` table for audit trail

3. **Credit Management Strategy**

   - Use database-cached lookups when possible (1 credit)
   - Reserve turbo mode (25 credits) for priority requests
   - Monitor and log credit consumption per API call
   - Implement credit balance tracking in app settings
   - Create alerts for low credit balance

4. **Error Handling**

   - Map HubDo error messages to application-specific errors
   - Implement retry logic for connection timeouts (max 3 retries with exponential backoff)
   - Distinguish between validation errors (invalid CPF) and service errors (unavailable)
   - Return meaningful user-facing messages and log full error context

5. **Database Schema**

   - Create `hubdo_cpf_lookups` table to store:
     - CPF queried
     - Birth date used (if provided)
     - Query mode (normal/turbo)
     - Result status (OK/NOK)
     - Response data (when OK)
     - Credits consumed
     - Timestamp
   - Enable future analytics and credit reconciliation

## Consequences

**Positive:**
- Official Receita Federal validation via trusted intermediary
- Reduces dependency on web scraping and portal vulnerabilities
- Provides audit trail of CPF lookups for compliance
- Flexible query modes for different urgency levels

**Negative:**
- Introduces external dependency (HubDo availability, token management)
- Credit-based model requires budget management and monitoring
- Performance varies: cached (fast), normal (5+ min), turbo (30s)
- Requires IP whitelisting configuration in multiple environments

**Mitigation:**
- Implement comprehensive monitoring and alerting
- Use database caching aggressively
- Provide admin dashboard for credit tracking
- Document setup process and troubleshooting for team

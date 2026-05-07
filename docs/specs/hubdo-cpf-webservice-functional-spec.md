# Functional Specification - HubDo CPF WebService Integration

## Objective

Enable official CPF validation and person data lookup via HubDo's WebService integration with Receita Federal, providing users with authoritative CPF information and supporting internal audit requirements.

## Scope

- Integrate HubDo CPF WebService API for CPF validation and person data retrieval
- Support two query modes: standard (cached/Receita Federal) and turbo (expedited Receita Federal)
- Persist all lookup operations for audit trail and credit tracking
- Provide API endpoint for frontend CPF lookups
- Implement credit management and monitoring
- Handle error scenarios and service unavailability

## User Journey

### CPF Lookup in Get CPFs by Name flow

1. User searches for a person by name via portal
2. System collects candidate CPFs from results
3. User selects a CPF from modal or directly inputs it
4. System validates CPF via HubDo (triggers lookup)
5. User sees official Receita Federal data (name, birth date, status)
6. System saves lookup to database and updates credit metrics

### CPF Lookup in Filter by CPF flow

1. User searches by partial CPF
2. System collects results from database cache
3. User can initiate HubDo verification on selected CPF
4. System queries HubDo for official status
5. User views official record alongside cached data

## Inputs

### API Request
```
GET /api/hubdo-cpf-lookup?cpf=12345678901&birthDate=01/01/1990&mode=normal
```

- `cpf`: CPF digits only (11 digits), required
- `birthDate`: Birth date in DD/MM/YYYY format, optional (required for online queries)
- `mode`: "normal" (default) or "turbo", optional

## Outputs

### Success Response
```json
{
  "status": "success",
  "cpf": "123.456.789-01",
  "nome": "JOHN DOE",
  "dataNascimento": "01/01/1990",
  "situacaoCadastral": "REGULAR",
  "dataInscricao": "10/11/1990",
  "digitoVerificador": "00",
  "comprovante": "CE0E.8687.3D2E.E534",
  "dataComprovante": "09:02:38 às 27/01/2017",
  "creditosConsumidos": 1,
  "origem": "database" | "receita_federal" | "turbo"
}
```

### Error Response
```json
{
  "status": "error",
  "errorCode": "INVALID_CPF" | "TOKEN_INVALID" | "TIMEOUT" | "SERVICE_UNAVAILABLE",
  "message": "User-friendly error message",
  "creditosConsumidos": 0
}
```

## Business Rules

1. **Credit Consumption**
   - Database cache hit: 1 credit
   - Receita Federal lookup: 5 credits
   - Turbo mode: 25 credits
   - No credits consumed on errors

2. **CPF Validation**
   - Accept 11-digit CPF (formatted or unformatted)
   - Normalize to digits only before API call
   - Return formatted CPF (XXX.XXX.XXX-XX)

3. **Query Routing**
   - Normal mode: Query database first, fallback to Receita Federal if not found
   - Turbo mode: Direct Receita Federal query (skip database)
   - Last_update mode: Check database existence without consuming credits (future)

4. **Error Handling**
   - Invalid CPF format: Return 400 error immediately
   - Missing birth date for online query: Attempt database query only
   - Token errors: Log alert, disable HubDo endpoint temporarily
   - Timeout (>600s normal, >30s turbo): Retry up to 3 times with exponential backoff
   - IP not authorized: Log config error, require admin action

5. **Data Persistence**
   - All queries logged to `hubdo_cpf_lookups` table
   - Store: CPF, birth date, mode, status, response data, credits used, timestamp
   - Enable future analytics, credit reconciliation, compliance audit

## Non-Functional Requirements

- **Performance**: Normal queries ≤ 600s, turbo queries ≤ 30s timeout
- **Reliability**: 99% uptime target for API endpoint (HubDo availability permitting)
- **Security**: Token stored in environment variables, IP whitelisting enforced
- **Monitoring**: Log all lookups, credit consumption, errors with full context
- **Scalability**: Support concurrent lookups with connection pooling

## Acceptance Criteria

1. ✅ HubDo WebService integration implemented and tested
2. ✅ CPF lookup endpoint (`GET /api/hubdo-cpf-lookup`) operational
3. ✅ Both standard and turbo modes functional
4. ✅ All lookups persisted to database for audit trail
5. ✅ Credit consumption tracked and reported
6. ✅ Error handling for all documented error codes
7. ✅ Integration tests verify API contracts
8. ✅ Admin dashboard shows credit balance and usage trends

## Requirement Traceability

1. Domain layer
   - `src/hubdoCpf/domain/types.ts`
   - `src/hubdoCpf/domain/hubdo-cpf.repository.ts`

2. Application layer
   - `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`
   - `src/hubdoCpf/application/hubdo-credit-calculator.service.ts`

3. Infrastructure layer
   - `src/hubdoCpf/infrastructure/http-hubdo-client.ts`
   - `src/hubdoCpf/infrastructure/drizzle-hubdo-cpf-lookup.repository.ts`

4. API routes
   - `app/api/hubdo-cpf-lookup/route.ts`

5. Database schema
   - `src/database/schema.ts` (hubdo_cpf_lookups table)

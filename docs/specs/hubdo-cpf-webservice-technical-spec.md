# Technical Specification - HubDo CPF WebService Integration

## Overview

Implement HubDo WebService integration for official CPF validation and person data retrieval. Architecture includes HTTP client wrapper, service layer for orchestration, repository for audit persistence, and API endpoint for frontend consumption.

## Data Model

### Database Schema

Table: `hubdo_cpf_lookups`

```typescript
{
  id: uuid (pk),
  cpf: text (not null, indexed),
  birthDate: text (nullable),
  queryMode: enum('normal' | 'turbo'),
  requestStatus: enum('OK' | 'NOK'),
  errorCode: text (nullable),
  errorMessage: text (nullable),
  responseName: text (nullable),
  responseBirthDate: text (nullable),
  responseCadastralStatus: text (nullable),
  responseInscriptionDate: text (nullable),
  responseCheckDigit: text (nullable),
  responseProof: text (nullable),
  responseProofDate: text (nullable),
  creditosConsumidos: int (not null),
  origem: enum('database' | 'receita_federal' | 'turbo'),
  fullResponse: jsonb (nullable),
  createdAt: timestamptz,
  updatedAt: timestamptz
}
```

### Domain Model

File: `src/hubdoCpf/domain/types.ts`

```typescript
// Input contracts
export interface HubdoCpfLookupRequest {
  cpf: string;
  birthDate?: string; // DD/MM/YYYY
  mode?: 'normal' | 'turbo';
}

// Output contracts
export interface HubdoCpfLookupResponse {
  status: 'success' | 'error';
  cpf: string;
  nome?: string;
  dataNascimento?: string;
  situacaoCadastral?: string;
  dataInscricao?: string;
  digitoVerificador?: string;
  comprovante?: string;
  dataComprovante?: string;
  creditosConsumidos: number;
  origem?: 'database' | 'receita_federal' | 'turbo';
  errorCode?: string;
  message?: string;
}

export interface HubdoCpfLookupRecord {
  id: string;
  cpf: string;
  birthDate?: string;
  queryMode: 'normal' | 'turbo';
  requestStatus: 'OK' | 'NOK';
  creditosConsumidos: number;
  origem: string;
  createdAt: Date;
}

// Repository interface
export interface HubdoCpfLookupRepository {
  save(lookup: HubdoCpfLookupInput): Promise<HubdoCpfLookupRecord>;
  getById(id: string): Promise<HubdoCpfLookupRecord | null>;
  listByCpf(cpf: string): Promise<HubdoCpfLookupRecord[]>;
}

// Error types
export class HubdoCpfError extends Error {
  constructor(
    public code: string,
    message: string,
    public creditosConsumidos: number = 0
  ) {
    super(message);
    this.name = 'HubdoCpfError';
  }
}
```

## Domain Module Structure

Path: `src/hubdoCpf/`

### 1. Domain Layer

File: `src/hubdoCpf/domain/types.ts`
- Request/response DTOs
- Repository interface
- Error classes
- Type definitions

### 2. Application Layer

File: `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`

```typescript
export class HubdoCpfLookupService {
  constructor(
    private httpClient: HubdoHttpClient,
    private repository: HubdoCpfLookupRepository
  ) {}

  async lookup(request: HubdoCpfLookupRequest): Promise<HubdoCpfLookupResponse> {
    // 1. Validate CPF format
    // 2. Normalize CPF (remove formatting)
    // 3. Determine query mode
    // 4. Call HubdoHttpClient
    // 5. Parse response
    // 6. Persist to repository
    // 7. Return mapped response
  }

  private validateCpf(cpf: string): boolean
  private normalizeCpf(cpf: string): string
  private formatCpf(cpf: string): string
  private mapHubdoResponse(raw: any): HubdoCpfLookupResponse
}
```

File: `src/hubdoCpf/application/hubdo-credit-calculator.service.ts`

```typescript
export class HubdoCreditCalculatorService {
  calculateCredits(
    origin: 'database' | 'receita_federal' | 'turbo'
  ): number {
    // database: 1 credit
    // receita_federal: 5 credits
    // turbo: 25 credits
  }

  shouldAttemptTurbo(priority: 'normal' | 'high'): boolean
}
```

### 3. Infrastructure Layer

File: `src/hubdoCpf/infrastructure/http-hubdo-client.ts`

```typescript
export class HubdoHttpClient {
  constructor(
    private token: string,
    private baseUrl: string = 'https://ws.hubdodesenvolvedor.com.br/v2'
  ) {}

  async queryCpf(
    cpf: string,
    birthDate?: string,
    turbo: boolean = false
  ): Promise<HubdoRawResponse> {
    // 1. Build query parameters
    // 2. Validate token and IP
    // 3. Make HTTP GET request with timeout
    // 4. Handle connection errors and retries
    // 5. Parse JSON response
    // 6. Map error codes to domain errors
  }

  private buildUrl(cpf: string, birthDate?: string, turbo?: boolean): string
  private async retryWithBackoff(
    fn: () => Promise<any>,
    maxRetries: number = 3
  ): Promise<any>
}
```

File: `src/hubdoCpf/infrastructure/drizzle-hubdo-cpf-lookup.repository.ts`

```typescript
export class DrizzleHubdoCpfLookupRepository implements HubdoCpfLookupRepository {
  async save(lookup: HubdoCpfLookupInput): Promise<HubdoCpfLookupRecord>
  async getById(id: string): Promise<HubdoCpfLookupRecord | null>
  async listByCpf(cpf: string): Promise<HubdoCpfLookupRecord[]>
}
```

### 4. Module Index

File: `src/hubdoCpf/index.ts`

```typescript
export function createHubdoCpfLookupService(): HubdoCpfLookupService {
  const httpClient = new HubdoHttpClient(process.env.HUBDO_TOKEN!);
  const repository = new DrizzleHubdoCpfLookupRepository();
  return new HubdoCpfLookupService(httpClient, repository);
}
```

## API Routes

### Route: `app/api/hubdo-cpf-lookup/route.ts`

```typescript
export async function GET(request: Request): Promise<NextResponse> {
  // Query params: cpf, birthDate, mode
  // 1. Extract and validate parameters
  // 2. Create service instance
  // 3. Call service.lookup()
  // 4. Return response or error
}
```

### Example Requests

```
GET /api/hubdo-cpf-lookup?cpf=12345678901
GET /api/hubdo-cpf-lookup?cpf=12345678901&birthDate=01/01/1990
GET /api/hubdo-cpf-lookup?cpf=12345678901&birthDate=01/01/1990&mode=turbo
```

### Response Codes

- `200`: Lookup completed (check status field for OK/NOK)
- `400`: Invalid parameters (missing CPF, bad format, etc.)
- `401`: Invalid token or IP not authorized
- `429`: Rate limited or credit limit exceeded
- `500`: Service error (HubDo unavailable, connection error, etc.)

## Environment Configuration

```bash
# .env
HUBDO_TOKEN=205658140XEQVFnpOeM371309536
HUBDO_BASE_URL=https://ws.hubdodesenvolvedor.com.br/v2
HUBDO_TIMEOUT_MS=600000      # 600s for normal queries
HUBDO_TURBO_TIMEOUT_MS=30000 # 30s for turbo queries
HUBDO_MAX_RETRIES=3
HUBDO_BACKOFF_MS=1000
```

## Error Handling Strategy

| HubDo Error | Domain Error | HTTP Status | Message |
|---|---|---|---|
| Parametro Invalido | INVALID_CPF | 400 | CPF format invalid |
| Data de Nascimento não informada | MISSING_BIRTHDATE | 400 | Birth date required |
| CPF Inválido | CPF_NOT_FOUND | 404 | CPF not found in Receita |
| Token Inválido | INVALID_TOKEN | 401 | Authentication failed |
| Token sem saldo | INSUFFICIENT_CREDITS | 429 | Insufficient credits |
| IP não permitido | IP_NOT_AUTHORIZED | 403 | IP not whitelisted |
| Timeout | SERVICE_TIMEOUT | 504 | Request timeout |
| Conexão falha | SERVICE_UNAVAILABLE | 503 | Service unavailable |

## Validation and Error Handling

### Input Validation

```typescript
// CPF must be 11 digits (formatted or unformatted)
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

// Birth date format: DD/MM/YYYY
const birthDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

// Mode must be 'normal' or 'turbo'
const validModes = ['normal', 'turbo'];
```

### Service Error Handling

- Catch all exceptions in service
- Map to domain error codes
- Log full error context for debugging
- Return meaningful user-facing messages
- Always persist lookup attempt (even on error)

## Build and Validation

```bash
# Generate database migrations
pnpm db:generate

# Apply migrations
pnpm db:push

# Linting
npm run lint

# Build
npm run build

# Type checking
npm run type-check
```

## Testing Strategy

### Unit Tests

- CPF validation and normalization
- Credit calculation
- Error mapping
- Response parsing

### Integration Tests

- HubdoHttpClient with mocked responses
- Service orchestration
- Repository persistence
- API endpoint behavior

### Test Files

```
src/hubdoCpf/application/__tests__/hubdo-cpf-lookup.service.test.ts
src/hubdoCpf/infrastructure/__tests__/http-hubdo-client.test.ts
src/hubdoCpf/infrastructure/__tests__/drizzle-hubdo-cpf-lookup.repository.test.ts
app/api/hubdo-cpf-lookup/__tests__/route.test.ts
```

## Implementation Checklist

- [ ] Schema migration for `hubdo_cpf_lookups` table
- [ ] Domain types and interfaces
- [ ] HubdoHttpClient with retry logic
- [ ] HubdoCpfLookupService
- [ ] HubdoCreditCalculatorService
- [ ] DrizzleHubdoCpfLookupRepository
- [ ] API endpoint (`GET /api/hubdo-cpf-lookup`)
- [ ] Input validation and error mapping
- [ ] Unit tests for service layer
- [ ] Integration tests for HTTP client
- [ ] Build and type checking
- [ ] Documentation and team training

## Performance Considerations

- **Connection pooling**: Reuse HTTP connections
- **Timeout**: 600s normal, 30s turbo
- **Retry logic**: Max 3 retries with exponential backoff (1s, 2s, 4s)
- **Caching**: Consider Redis cache for recent lookups
- **Logging**: Structured logging for all operations and errors

## Monitoring and Observability

- Log all CPF lookups with timestamp, CPF (hashed), mode, result, credits
- Track credit consumption by hour/day/month
- Alert on token errors or IP authorization failures
- Create dashboard for credit balance and usage trends
- Enable audit trail for compliance reporting

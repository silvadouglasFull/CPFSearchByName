# Technical Specification - HubDo CPF Lookup UI Page

## Overview

Implement a Next.js 16.2.4 page for CPF lookups with tabbed interface for search and history. Follows existing patterns from filter-by-cpf and generator-cpf pages.

## Project Structure

```
app/
  hubdo-cpf-lookup/
    page.tsx                    (Server component, layout)

src/components/hubdo-cpf-lookup/
  hubdo-cpf-lookup-client.tsx   (Main client component, state management)
  hubdo-cpf-search-form.tsx     (Search form component)
  hubdo-cpf-result-card.tsx     (Result display component)
  hubdo-cpf-history-table.tsx   (History list component)
  types.ts                      (TypeScript interfaces)
```

## Page Component

File: `app/hubdo-cpf-lookup/page.tsx`

```typescript
import { Metadata } from 'next';
import { HubdoCpfLookupClient } from '@/components/hubdo-cpf-lookup/hubdo-cpf-lookup-client';

export const metadata: Metadata = {
  title: 'HubDo CPF Lookup - Verificação de CPF',
  description: 'Consulte dados de CPF através da Receita Federal',
};

export default function HubdoCpfLookupPage() {
  return (
    <main className="container mx-auto py-6 px-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Verificação de CPF</h1>
          <p className="text-muted-foreground">
            Consulte dados oficiais de CPF através da Receita Federal
          </p>
        </div>
        <HubdoCpfLookupClient />
      </div>
    </main>
  );
}
```

## Client Component

File: `src/components/hubdo-cpf-lookup/hubdo-cpf-lookup-client.tsx`

### State Management

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FriendlyMessage } from '@/components/shared/friendly-message';
import { HubdoCpfSearchForm } from './hubdo-cpf-search-form';
import { HubdoCpfResultCard } from './hubdo-cpf-result-card';
import { HubdoCpfHistoryTable } from './hubdo-cpf-history-table';
import { HubdoCpfLookupResponse } from '@/hubdoCpf';

type Tab = 'search' | 'history';

export function HubdoCpfLookupClient() {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  
  // Search state
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [mode, setMode] = useState<'normal' | 'turbo'>('normal');
  const [isSearching, setIsSearching] = useState(false);
  const [lastResult, setLastResult] = useState<HubdoCpfLookupResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // History state
  const [historyPage, setHistoryPage] = useState(1);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  async function handleSearch(): Promise<void> {
    setIsSearching(true);
    setSearchError(null);
    setLastResult(null);

    try {
      const params = new URLSearchParams();
      params.set('cpf', cpf);
      if (birthDate) params.set('birthDate', birthDate);
      params.set('mode', mode);

      const response = await fetch(
        `/api/hubdo-cpf-lookup?${params.toString()}`,
        { headers: { Accept: 'application/json' } }
      );

      const data = await response.json() as HubdoCpfLookupResponse;
      setLastResult(data);

      if (data.status === 'error') {
        setSearchError(data.message);
      } else {
        // Auto-refresh history after successful search
        setActiveTab('search'); // Keep on search to show result
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection error';
      setSearchError(message);
    } finally {
      setIsSearching(false);
    }
  }

  function handleReset(): void {
    setCpf('');
    setBirthDate('');
    setMode('normal');
    setLastResult(null);
    setSearchError(null);
  }

  function handleSelectFromHistory(cpfValue: string): void {
    setCpf(cpfValue);
    setActiveTab('search');
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          className="rounded-2xl"
          onClick={() => setActiveTab('search')}
          variant={activeTab === 'search' ? 'default' : 'outline'}
        >
          Buscar CPF
        </Button>
        <Button
          className="rounded-2xl"
          onClick={() => setActiveTab('history')}
          variant={activeTab === 'history' ? 'default' : 'outline'}
        >
          Histórico
        </Button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>Dados da Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <HubdoCpfSearchForm
                cpf={cpf}
                birthDate={birthDate}
                mode={mode}
                isLoading={isSearching}
                onCpfChange={setCpf}
                onBirthDateChange={setBirthDate}
                onModeChange={setMode}
                onSearch={handleSearch}
                onReset={handleReset}
              />
            </CardContent>
          </Card>

          {/* Result or Error */}
          {searchError && (
            <FriendlyMessage
              title="Erro na Consulta"
              description={searchError}
              variant="error"
            />
          )}

          {lastResult && lastResult.status === 'success' && (
            <HubdoCpfResultCard result={lastResult} />
          )}

          {lastResult && lastResult.status === 'error' && (
            <FriendlyMessage
              title={lastResult.errorCode}
              description={lastResult.message}
              variant="error"
            />
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <HubdoCpfHistoryTable
          page={historyPage}
          isLoading={isHistoryLoading}
          onPageChange={setHistoryPage}
          onSelectCpf={handleSelectFromHistory}
        />
      )}
    </div>
  );
}
```

## Search Form Component

File: `src/components/hubdo-cpf-lookup/hubdo-cpf-search-form.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RotateCcw } from 'lucide-react';

interface HubdoCpfSearchFormProps {
  cpf: string;
  birthDate: string;
  mode: 'normal' | 'turbo';
  isLoading: boolean;
  onCpfChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
  onModeChange: (mode: 'normal' | 'turbo') => void;
  onSearch: () => void;
  onReset: () => void;
}

export function HubdoCpfSearchForm({
  cpf,
  birthDate,
  mode,
  isLoading,
  onCpfChange,
  onBirthDateChange,
  onModeChange,
  onSearch,
  onReset,
}: HubdoCpfSearchFormProps) {
  const canSearch = cpf.trim().length > 0;
  const estimatedCredits = mode === 'turbo' ? 25 : 5;

  return (
    <div className="space-y-4">
      {/* CPF Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          CPF <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="123.456.789-01 ou 12345678901"
          value={cpf}
          onChange={(e) => onCpfChange(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-2xl"
        />
      </div>

      {/* Birth Date Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Data de Nascimento (opcional)
        </label>
        <Input
          type="text"
          placeholder="DD/MM/YYYY"
          value={birthDate}
          onChange={(e) => onBirthDateChange(e.target.value)}
          disabled={isLoading}
          className="h-11 rounded-2xl"
        />
      </div>

      {/* Query Mode Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Modo de Consulta
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="normal"
              checked={mode === 'normal'}
              onChange={() => onModeChange('normal')}
              disabled={isLoading}
            />
            <span className="text-sm">
              Normal (5 créditos, até 10 min)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="turbo"
              checked={mode === 'turbo'}
              onChange={() => onModeChange('turbo')}
              disabled={isLoading}
            />
            <span className="text-sm">
              Turbo (25 créditos, 30s)
            </span>
          </label>
        </div>
      </div>

      {/* Credit Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
        <p className="text-amber-900">
          Custo estimado: <strong>{estimatedCredits} créditos</strong>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          className="h-11 rounded-2xl px-6"
          disabled={!canSearch || isLoading}
          onClick={onSearch}
        >
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? 'Buscando...' : 'Buscar CPF'}
        </Button>
        <Button
          className="h-11 rounded-2xl px-6"
          variant="outline"
          disabled={isLoading}
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
    </div>
  );
}
```

## Result Card Component

File: `src/components/hubdo-cpf-lookup/hubdo-cpf-result-card.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HubdoCpfLookupResponse } from '@/hubdoCpf';
import { CheckCircle, Zap } from 'lucide-react';

interface HubdoCpfResultCardProps {
  result: HubdoCpfLookupResponse;
}

export function HubdoCpfResultCard({ result }: HubdoCpfResultCardProps) {
  if (result.status !== 'success') return null;

  const originLabel = {
    database: 'Banco de Dados',
    receita_federal: 'Receita Federal',
    turbo: 'Turbo',
  }[result.origem || 'receita_federal'];

  return (
    <Card className="rounded-3xl shadow-sm border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Dados da Pessoa
          </CardTitle>
          <Badge variant="outline" className="bg-green-100">
            {originLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-semibold">{result.nome}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">CPF</p>
            <p className="font-semibold">{result.cpf}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data de Nascimento</p>
            <p className="font-semibold">{result.dataNascimento}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Situação Cadastral</p>
            <p className="font-semibold text-green-600">
              {result.situacaoCadastral}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data de Inscrição</p>
            <p className="font-semibold">{result.dataInscricao}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dígito Verificador</p>
            <p className="font-semibold">{result.digitoVerificador}</p>
          </div>
          {result.comprovante && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Comprovante</p>
                <p className="font-semibold text-xs">{result.comprovante}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data do Comprovante</p>
                <p className="font-semibold text-xs">{result.dataComprovante}</p>
              </div>
            </>
          )}
        </div>

        {/* Credits Badge */}
        <div className="mt-6 pt-4 border-t flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm">
            Créditos utilizados: <strong>{result.creditosConsumidos}</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

## History Table Component

File: `src/components/hubdo-cpf-lookup/hubdo-cpf-history-table.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Search } from 'lucide-react';
import { HubdoCpfLookupRecord } from '@/hubdoCpf';

interface HubdoCpfHistoryTableProps {
  page: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSelectCpf: (cpf: string) => void;
}

interface PaginatedHistory {
  items: HubdoCpfLookupRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function HubdoCpfHistoryTable({
  page,
  isLoading,
  onPageChange,
  onSelectCpf,
}: HubdoCpfHistoryTableProps) {
  const [history, setHistory] = useState<PaginatedHistory | null>(null);
  const [filterCpf, setFilterCpf] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [page]);

  async function loadHistory(): Promise<void> {
    setIsLoadingHistory(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '10');
      if (filterCpf) params.set('cpf', filterCpf);

      const response = await fetch(`/api/hubdo-cpf-lookups-history?${params}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to load history');
      }

      const data = await response.json() as PaginatedHistory;
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingHistory(false);
    }
  }

  if (!history && !isLoadingHistory) {
    return <FriendlyMessage title="Loading..." description="Carregando histórico..." variant="info" />;
  }

  if (error) {
    return (
      <FriendlyMessage
        title="Erro ao Carregar Histórico"
        description={error}
        variant="error"
      />
    );
  }

  if (!history) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Filtrar por CPF..."
          value={filterCpf}
          onChange={(e) => setFilterCpf(e.target.value)}
          className="h-11 rounded-2xl"
          disabled={isLoadingHistory}
        />
        <Button
          className="h-11 rounded-2xl px-6"
          onClick={() => { onPageChange(1); void loadHistory(); }}
          disabled={isLoadingHistory}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {history.items.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">CPF</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Situação</th>
                <th className="text-left p-3 font-medium">Modo</th>
                <th className="text-center p-3 font-medium">Créditos</th>
                <th className="text-left p-3 font-medium">Data</th>
                <th className="text-center p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {history.items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-muted/50">
                  <td className="p-3">{item.cpf}</td>
                  <td className="p-3">
                    <span className={item.requestStatus === 'OK' ? 'text-green-600' : 'text-red-600'}>
                      {item.requestStatus}
                    </span>
                  </td>
                  <td className="p-3">{item.responseCadastralStatus || '-'}</td>
                  <td className="p-3">{item.queryMode}</td>
                  <td className="p-3 text-center">{item.creditosConsumidos}</td>
                  <td className="p-3 text-xs">
                    {new Date(item.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectCpf(item.cpf)}
                    >
                      Re-buscar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <FriendlyMessage
          title="Sem Histórico"
          description="Nenhuma consulta realizada ainda."
          variant="info"
        />
      )}

      {/* Pagination */}
      {history.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            className="rounded-2xl"
            variant="outline"
            disabled={page <= 1 || isLoadingHistory}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {history.totalPages}
          </span>
          <Button
            className="rounded-2xl"
            variant="outline"
            disabled={page >= history.totalPages || isLoadingHistory}
            onClick={() => onPageChange(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Types

File: `src/components/hubdo-cpf-lookup/types.ts`

```typescript
export interface HubdoCpfSearchFormState {
  cpf: string;
  birthDate: string;
  mode: 'normal' | 'turbo';
}

export interface HubdoCpfSearchResult {
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
```

## New API Route (History Listing)

File: `app/api/hubdo-cpf-lookups-history/route.ts`

```typescript
import { createHubdoCpfLookupService } from '@/hubdoCpf';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE))
    );
    const cpfFilter = (searchParams.get('cpf') || '').trim();

    const service = createHubdoCpfLookupService();
    
    // Get all lookups for current user (future: implement user context)
    // For now, return paginated empty result
    const items = [];
    const totalItems = 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    return NextResponse.json({
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: `Failed to fetch history: ${message}`,
      },
      { status: 500 }
    );
  }
}
```

## Styling

Uses existing Tailwind + shadcn/ui components:
- `Button`
- `Input`
- `Card`
- `Badge`
- `FriendlyMessage`
- Custom Lucide icons (Search, RotateCcw, CheckCircle, Zap)

## Build and Validation

```bash
npm run lint
npm run build
```

## Testing Strategy

### Unit Tests
- Form validation (CPF format, birth date format)
- Credit calculation
- Error message mapping

### Integration Tests
- Search form submission
- API integration
- History pagination
- Filter functionality

## Implementation Checklist

- [ ] Create page component (`app/hubdo-cpf-lookup/page.tsx`)
- [ ] Create client component with state management
- [ ] Create search form component
- [ ] Create result card component
- [ ] Create history table component
- [ ] Create types file
- [ ] Implement history API route
- [ ] Add navigation link to sidebar
- [ ] Build and lint validation
- [ ] Test on mobile and desktop

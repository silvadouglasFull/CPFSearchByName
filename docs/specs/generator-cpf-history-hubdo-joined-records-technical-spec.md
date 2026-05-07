# Technical Specification - Método de records com LEFT JOIN HubDo em DrizzleGeneratorCpfHistoryRepository

## Overview

Adicionar no `DrizzleGeneratorCpfHistoryRepository` um método que retorna os records de `generator_cpf_history_records` com dados de `hubdo_cpf_lookups` via `LEFT JOIN` pela FK, para uso na aba History do `GeneratorCpfClient`.

## Data model assumptions

- `generator_cpf_history_records` possui coluna FK `hubdo_lookup_id` nullable.
- FK referencia `hubdo_cpf_lookups.id`.
- A ausência de vínculo deve ser preservada no retorno (join opcional).

## Repository changes

### Interface de domínio

Arquivo: `src/generatorCpfHistory/domain/types.ts`

Adicionar tipos:

- `GeneratorCpfHistoryRecordLookupInfo`
- `GeneratorCpfHistoryRecordWithLookup`

Campos sugeridos para lookup info:

- `id`
- `requestStatus`
- `queryMode`
- `errorCode`
- `errorMessage`
- `responseName`
- `responseBirthDate`
- `responseCadastralStatus`
- `creditosConsumidos`
- `origem`
- `createdAt`

Adicionar contrato no repositório:

- `listRecordsWithLookupByHistoryId(historyId: string): Promise<GeneratorCpfHistoryRecordWithLookup[]>`

### Implementação no Drizzle

Arquivo: `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`

Implementar método com:

- `select` de campos de `generatorCpfHistoryRecords`.
- `leftJoin(hubdoCpfLookups, eq(generatorCpfHistoryRecords.hubdoLookupId, hubdoCpfLookups.id))`.
- `where(eq(generatorCpfHistoryRecords.historyId, historyId))`.
- `orderBy(asc(generatorCpfHistoryRecords.createdAt))`.

Mapeamento de saída:

- Sempre retornar dados do record.
- Retornar `hubdoLookup: null` quando colunas do lookup vierem nulas.
- Retornar objeto `hubdoLookup` preenchido quando houver match.

## Service changes

Arquivo: `src/generatorCpfHistory/application/generator-cpf-history.service.ts`

- Adicionar método de aplicação para obter details com records enriquecidos.
- Opção A: novo método `getByIdWithLookup(id)` que retorna snapshot + `resultRecords` enriquecidos.
- Opção B: manter `getById` e trocar internamente para usar listagem enriquecida.

Recomendação:

- Usar Opção A para preservar compatibilidade e adoção gradual.

## API changes

Arquivo: `app/api/generator-cpf-history/[id]/route.ts`

- Ajustar `GET` para responder item com `resultRecords` enriquecidos.
- Manter status 200 quando snapshot existir mesmo se nenhum item tiver lookup vinculado.
- Não alterar semântica de erro atual para 404/500.

## Frontend contract changes

Arquivo: `src/components/generator-cpf/types.ts`

- Evoluir `GeneratorCpfHistoryRecord.resultRecords` para suportar bloco opcional:
  - `hubdoLookup?: { ... } | null`

Compatibilidade:

- Campos atuais de record devem permanecer para não quebrar Search tab e outros consumidores.

## UI changes

Arquivo: `src/components/generator-cpf/generator-cpf-client.tsx`

- Na aba History, consumir `resultRecords` enriquecidos da rota de details.
- Renderizar informações HubDo por linha (ou em bloco contextual) quando `hubdoLookup` existir.
- Renderizar fallback quando `hubdoLookup` estiver ausente:
  - texto sugerido: "Sem consulta HubDo vinculada".

Arquivo opcional de apresentação:

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

Se necessário, estender componente para coluna/indicador de status HubDo sem quebrar uso no Search tab.

## Query and performance considerations

- Left join por `history_id` deve estar indexado por:
  - índice existente/recomendado em `generator_cpf_history_records.history_id`
  - índice recomendado em `generator_cpf_history_records.hubdo_lookup_id`
- Em snapshots grandes, considerar paginação de records em evolução futura.

## Error and fallback semantics

- Service/API: ausência de lookup vinculado não é erro.
- Frontend: ausência de lookup deve gerar estado informativo, não alerta de erro.

## Validation checklist

1. Repositório

- Método retorna records de um snapshot com `hubdoLookup` preenchido quando houver vínculo.
- Método retorna records com `hubdoLookup = null` quando não houver vínculo.

2. API

- `GET /api/generator-cpf-history/[id]` retorna payload enriquecido.
- Snapshot inexistente continua retornando 404.

3. UI

- Aba History renderiza records com dados HubDo quando presentes.
- Aba History renderiza fallback quando dados HubDo ausentes.
- Não há regressão na aba Search.

4. Qualidade

- `npm run lint`
- `npm run build`

## Implementation traceability

- `src/generatorCpfHistory/domain/types.ts`
- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`
- `src/generatorCpfHistory/application/generator-cpf-history.service.ts`
- `app/api/generator-cpf-history/[id]/route.ts`
- `src/components/generator-cpf/types.ts`
- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`

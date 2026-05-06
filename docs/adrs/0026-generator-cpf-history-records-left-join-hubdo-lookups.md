# ADR 0026 - Left Join de generatorCpf History Records com HubDo Lookups

## Status

Proposed

## Context

A aba History de generator-cpf já permite visualizar snapshots e seus CPFs persistidos.
Com a FK entre `generator_cpf_history_records` e `hubdo_cpf_lookups`, surgiu a necessidade de retornar, no mesmo fluxo, os dados do registro de CPF gerado e os dados da consulta HubDo associada.

O repositório atual `DrizzleGeneratorCpfHistoryRepository` retorna os registros de snapshot sem enriquecimento de lookup HubDo.
Isso limita a UI para mostrar, em um único payload, se o CPF foi verificado e o resultado dessa verificação.

## Decision

1. Adicionar método dedicado no repositório

- Criar em `DrizzleGeneratorCpfHistoryRepository` um método para retornar itens de `generator_cpf_history_records` com `LEFT JOIN` em `hubdo_cpf_lookups` via FK.
- O método deve ser orientado por `historyId` para uso em detalhes da aba History.

2. Retornar dados combinados record + lookup

- O retorno deve incluir todos os campos relevantes do record de histórico (`id`, `historyId`, `cpf`, `formattedCpf`, `baseNineDigits`, `createdAt` etc.).
- O retorno deve incluir também dados de `hubdo_cpf_lookups` quando houver vínculo (`id`, `requestStatus`, `queryMode`, `errorCode`, `errorMessage`, `responseName`, `responseBirthDate`, `responseCadastralStatus`, `creditosConsumidos`, `origem`, `createdAt` etc.).

3. Manter comportamento resiliente com LEFT JOIN

- Se não existir lookup vinculado, o item continua sendo retornado com bloco HubDo nulo.
- A ausência de dados HubDo não é erro de domínio nem erro de endpoint.

4. Expor resultado enriquecido via service/API

- Ajustar service e endpoint de detalhes de histórico para usar o novo método.
- `GeneratorCpfClient` na aba History deve consumir esse payload enriquecido.

5. UI com fallback explícito

- A UI deve prever estados para item sem consulta HubDo:
  - badge ou texto de "Não consultado";
  - ausência de erro visual quando bloco HubDo vier nulo.

## Consequences

### Positive

- A aba History passa a mostrar contexto completo do CPF gerado e da verificação HubDo no mesmo fluxo.
- Reduz chamadas adicionais e lógica de composição no frontend.
- Aproveita a FK e fortalece rastreabilidade do ciclo de verificação.

### Negative

- Aumenta complexidade de tipos, mapeamento e serialização no backend.
- Pode elevar payload da rota de detalhes quando snapshots tiverem muitos registros.

### Mitigation

- Limitar campos retornados para os necessários de UI.
- Manter semântica de `hubdoLookup: null` para evitar tratamento de erro indevido.
- Aplicar paginação futura em records se houver necessidade de escala.

## Related ADRs

- ADR 0017 - generatorCpf History with Normalized CPF Records and History Details Action
- ADR 0019 - HubDo CPF WebService Integration
- ADR 0023 - Generator CPF Multi-Selection and Bulk HubDo Lookup
- ADR 0025 - FK from generatorCpf History Records to HubDo CPF Lookups

## Traceability

1. Repositório e domínio

- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`
- `src/generatorCpfHistory/domain/types.ts`
- `src/generatorCpfHistory/application/generator-cpf-history.service.ts`

2. API de histórico

- `app/api/generator-cpf-history/[id]/route.ts`

3. Frontend History

- `src/components/generator-cpf/types.ts`
- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`

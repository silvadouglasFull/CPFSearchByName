# Functional Specification - History de CPFs gerados com dados HubDo no mesmo payload

## Objective

Na aba History de `generator-cpf`, exibir os CPFs gerados persistidos junto das informações da consulta HubDo associada, quando existir vínculo via FK.

## Scope

- Criar método no repositório `DrizzleGeneratorCpfHistoryRepository` para obter records de `generator_cpf_history_records` com left join em `hubdo_cpf_lookups`.
- Expor retorno enriquecido pelo service e endpoint de detalhes de histórico.
- Ajustar `GeneratorCpfClient` para usar esse retorno na aba History.
- Garantir fallback de UI quando não houver dados de lookup HubDo.

## User journey

1. Usuário abre página `generator-cpf`.
2. Usuário entra na aba History.
3. Usuário clica para visualizar registros de um snapshot.
4. Sistema busca snapshot + records enriquecidos com HubDo.
5. UI lista os CPFs gerados e, para cada CPF:
   - mostra dados HubDo quando disponíveis;
   - mostra estado "não consultado" quando dados HubDo estiverem ausentes.

## Inputs

### Backend

- `historyId` do snapshot selecionado.
- Tabelas: `generator_cpf_history_records` e `hubdo_cpf_lookups`.

### Frontend

- Item selecionado na tabela de histórico.

## Outputs

- Lista de records com bloco HubDo opcional por item.
- Renderização da aba History com suporte a itens consultados e não consultados.

## Business rules

1. Regra de presença de dados HubDo

- Item com vínculo FK: deve conter informações de consulta HubDo.
- Item sem vínculo FK: deve retornar normalmente com HubDo nulo.

2. Semântica de ausência de lookup

- Ausência de lookup não deve ser tratada como erro de requisição.
- UI deve informar claramente que o CPF ainda não possui consulta vinculada.

3. Integridade de histórico

- Snapshot e records devem continuar visíveis mesmo sem consulta HubDo.

## Acceptance criteria

- Existe método em `DrizzleGeneratorCpfHistoryRepository` com left join entre records e lookups por FK.
- Endpoint de detalhes do histórico retorna records enriquecidos com dados HubDo opcionais.
- `GeneratorCpfClient` na aba History usa o retorno enriquecido.
- Para records sem lookup, UI renderiza fallback de ausência de consulta sem quebrar layout.
- Para records com lookup, UI renderiza os campos HubDo retornados.

## Requirement traceability

1. Repositório e contratos

- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`
- `src/generatorCpfHistory/domain/types.ts`

2. Service/API

- `src/generatorCpfHistory/application/generator-cpf-history.service.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

3. Frontend

- `src/components/generator-cpf/types.ts`
- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`

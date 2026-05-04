# ADR 0002 - Pipeline CLI interativo para orquestrar o fluxo

## Status

Aceito

## Contexto

O fluxo do projeto possui múltiplas etapas encadeadas: busca por nome, filtragem por CPF parcial, validação por UF e geração de candidatos. Executar essas etapas manualmente em comandos separados aumenta risco de erro operacional.

## Decisão

Consolidar a orquestração em um pipeline CLI interativo (`pipelineCpf.js`), com perguntas sequenciais ao usuário e encerramento antecipado quando condições mínimas não são atendidas.

## Consequências

- Melhor usabilidade para operação manual.
- Fluxo padronizado e repetível para execução ponta a ponta.
- Necessidade de manter mensagens e validações de entrada consistentes.

## Nota de Infraestrutura (2026-05-04)

Esta ADR permanece válida para a orquestração funcional do pipeline.
A infraestrutura da aplicação e o padrão arquitetural web passam a seguir a ADR 0005 (Next.js 16 App Router).

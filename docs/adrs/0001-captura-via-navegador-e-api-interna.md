# ADR 0001 - Captura de dados via navegador com interceptação da API interna

## Status

Aceito

## Contexto

O Portal da Transparência não entrega os resultados completos no HTML inicial em chamadas diretas de servidor. A paginação e o conteúdo de resultados são montados no navegador e protegidos por mecanismos que podem bloquear navegação automatizada simplificada.

## Decisão

Usar automação de navegador com Puppeteer para abrir a página de busca por nome e capturar as respostas da API interna acionada pela própria interface.

## Consequências

- Maior robustez para obter os registros esperados da busca.
- Dependência de execução com navegador disponível no ambiente.
- Maior custo de execução comparado a `fetch` puro.

## Nota de Infraestrutura (2026-05-04)

Esta ADR permanece válida para a regra de captura de dados.
A padronização de infraestrutura, organização de projeto, rotas e execução de aplicação web passa a ser regida pela ADR 0005 (Next.js 16 App Router).

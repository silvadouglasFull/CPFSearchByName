# ADR 0003 - Geração de candidatos de CPF com filtro de UF por dígito de região

## Status

Aceito

## Contexto

Após localizar um CPF parcial nos resultados, ainda existem muitos candidatos possíveis. O nono dígito base do CPF codifica região fiscal, o que permite reduzir o espaço de busca quando a UF do cadastro é conhecida.

## Decisão

Usar o mapeamento de UF para dígito em `identifyByState.json` e aplicar esse dígito como filtro na geração dos CPFs candidatos (`generatorCpf.js`).

## Consequências

- Redução de ambiguidades quando a UF é informada corretamente.
- Dependência da qualidade do mapeamento UF -> dígito.
- Necessidade de validação de entrada da UF em formato de duas letras.

## Nota de Infraestrutura (2026-05-04)

Esta ADR permanece válida para a regra de geração e filtro por UF.
As decisões de infraestrutura de aplicação web, rotas e organização de código passam a seguir a ADR 0005 (Next.js 16 App Router).

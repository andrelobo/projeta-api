# projeta-api

Backend do **PROJETA** — API NestJS, workers BullMQ e infraestrutura, implantado em VPS própria por pipeline de GitHub Actions.

> **Status:** fundação técnica (M0.1 e M0.2) concluída. Não há funcionalidade de produto, endpoints de negócio, banco ou fila conectados.
> A especificação vigente está em [andrelobo/projeta](https://github.com/andrelobo/projeta).

## Stack

- NestJS 12 + TypeScript strict
- Configuração tipada com Zod e fail-fast
- Vitest para testes unitários
- ESLint (flat config) + Prettier
- MongoDB Atlas, Redis + BullMQ e storage S3-compatible (previstos para os próximos incrementos)
- Publica `@projeta/contracts` (GitHub Packages) e `openapi.json`

## Requisitos

- Node.js 22 (`.nvmrc`)
- pnpm 11 (`corepack enable`)

## Como executar

```bash
cp .env.example .env      # ajuste se necessário
pnpm install
pnpm start:dev            # http://localhost:3000
```

A API valida o ambiente **antes** de subir. Se `MONGODB_URI`, `REDIS_URL` ou `CORS_ORIGIN` estiverem ausentes ou inválidas, o processo encerra com código 1 e informa apenas o campo com problema.

## Scripts

| Comando                                           | Função                |
| :------------------------------------------------ | :-------------------- |
| `pnpm start:dev`                                  | sobe em modo watch    |
| `pnpm build`                                      | compila para `dist/`  |
| `pnpm start:prod`                                 | executa o build       |
| `pnpm typecheck`                                  | TypeScript sem emitir |
| `pnpm lint` / `pnpm lint:fix`                     | ESLint                |
| `pnpm format` / `pnpm format:check`               | Prettier              |
| `pnpm test` / `pnpm test:watch` / `pnpm test:cov` | Vitest                |

## Estrutura atual

```
src/
├── main.ts                  # bootstrap com fail-fast de ambiente
├── app.module.ts            # módulo raiz (sem módulos de negócio)
└── config/
    ├── env.ts               # schema Zod e carregamento tipado
    ├── env.spec.ts          # testes do contrato de configuração
    ├── config.module.ts     # provider global da configuração
    └── config.constants.ts  # token de injeção
```

## Documentação

- [PRD](https://github.com/andrelobo/projeta/blob/main/docs/product/PRD.md)
- [System design](https://github.com/andrelobo/projeta/blob/main/docs/architecture/SYSTEM_DESIGN.md)
- [Especificações](https://github.com/andrelobo/projeta/blob/main/docs/specifications/README.md)
- [Plano de implementação](https://github.com/andrelobo/projeta/blob/main/docs/implementation/IMPLEMENTATION_PLAN.md)

## Licença

[Apache License 2.0](LICENSE) — © 2026 André Lobo (andrelobo). Ver ADR-025.

A licença cobre código e documentação; marca e identidade visual não são licenciadas.

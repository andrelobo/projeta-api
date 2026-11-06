# projeta-api

Backend do **PROJETA** — API NestJS, workers BullMQ e infraestrutura, implantado em VPS própria por pipeline de GitHub Actions.

> **Status:** fundação técnica (M0.1 a M0.3) concluída. Não há funcionalidade de produto, endpoints de negócio, banco ou fila conectados.
> A especificação vigente está em [andrelobo/projeta](https://github.com/andrelobo/projeta).

## Stack

- NestJS 12 + TypeScript strict
- Configuração tipada com Zod e fail-fast
- Health checks, Problem Details (RFC 9457) e request id
- Vitest + Supertest para testes unitários e E2E
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

## Endpoints disponíveis

| Método | Rota            | Resposta                                    |
| :----- | :-------------- | :------------------------------------------ |
| GET    | `/health/live`  | `200 { "status": "ok" }` — processo vivo    |
| GET    | `/health/ready` | `200` ou `503` com `checks` por dependência |

A readiness atual faz **verificação TCP** de Mongo e Redis. Os clientes reais substituem esses indicadores em M0.5/M0.8. Storage e fila entram quando existirem.

Toda resposta inclui `x-request-id`. Erros seguem Problem Details:

```json
{
  "type": "https://projeta.app/errors/not-found",
  "title": "Recurso não encontrado",
  "status": 404,
  "detail": "O recurso solicitado não existe.",
  "instance": "/rota-inexistente",
  "code": "NOT_FOUND",
  "requestId": "c2af57ea-165e-43de-bc36-f23a5308e272"
}
```

## Scripts

| Comando                                           | Função                |
| :------------------------------------------------ | :-------------------- |
| `pnpm start:dev`                                  | sobe em modo watch    |
| `pnpm build`                                      | compila para `dist/`  |
| `pnpm start:prod`                                 | executa o build       |
| `pnpm typecheck`                                  | TypeScript sem emitir |
| `pnpm lint` / `pnpm lint:fix`                     | ESLint                |
| `pnpm format` / `pnpm format:check`               | Prettier              |
| `pnpm test` / `pnpm test:watch` / `pnpm test:cov` | Vitest (unit + E2E)   |

## Estrutura atual

```
src/
├── main.ts                     # bootstrap com fail-fast de ambiente
├── app.module.ts               # módulo raiz (sem módulos de negócio)
├── common/
│   ├── configure-app.ts        # middleware, CORS, body limit e filtro global
│   ├── errors/                 # Problem Details (RFC 9457)
│   ├── filters/                # filtro global de exceções
│   └── http/                   # request id e tipos do Express
├── config/
│   ├── env.ts                  # schema Zod e carregamento tipado
│   ├── config.module.ts        # provider global da configuração
│   └── config.constants.ts     # token de injeção
└── health/
    ├── health.controller.ts    # /health/live e /health/ready
    ├── health.service.ts       # agrega indicadores
    ├── health.module.ts        # registra indicadores
    └── indicators/             # check TCP de Mongo e Redis
test/
└── app.e2e.spec.ts             # smoke E2E com Supertest
```

## Documentação

- [PRD](https://github.com/andrelobo/projeta/blob/main/docs/product/PRD.md)
- [System design](https://github.com/andrelobo/projeta/blob/main/docs/architecture/SYSTEM_DESIGN.md)
- [Especificações](https://github.com/andrelobo/projeta/blob/main/docs/specifications/README.md)
- [Plano de implementação](https://github.com/andrelobo/projeta/blob/main/docs/implementation/IMPLEMENTATION_PLAN.md)

## Licença

[Apache License 2.0](LICENSE) — © 2026 André Lobo (andrelobo). Ver ADR-025.

A licença cobre código e documentação; marca e identidade visual não são licenciadas.

# projeta-api

Backend do **PROJETA** — API NestJS, workers BullMQ e infraestrutura, implantado em VPS própria por pipeline de GitHub Actions.

> **Status:** pré-implementação. Nenhuma funcionalidade de aplicação foi escrita.
> A especificação vigente está em [andrelobo/projeta](https://github.com/andrelobo/projeta).

## Stack prevista

- NestJS + TypeScript strict
- MongoDB Atlas, Redis + BullMQ, storage S3-compatible
- API e worker na mesma imagem; deploy em `/home/lobojoe/projeta` com Docker Compose e Caddy
- Publica `@projeta/contracts` (GitHub Packages) e `openapi.json`

## Documentação

- [PRD](https://github.com/andrelobo/projeta/blob/main/docs/product/PRD.md)
- [System design](https://github.com/andrelobo/projeta/blob/main/docs/architecture/SYSTEM_DESIGN.md)
- [Especificações](https://github.com/andrelobo/projeta/blob/main/docs/specifications/README.md)
- [Plano de implementação](https://github.com/andrelobo/projeta/blob/main/docs/implementation/IMPLEMENTATION_PLAN.md)

## Licença

A definir (OPEN-047).

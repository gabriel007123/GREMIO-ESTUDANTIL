# Sistema de Votação Estudantil

Sistema React + Vite com uma API Node/Express simples para registrar votos e impedir que a mesma matrícula vote duas vezes.

## Site estático

https://gabriel007123.github.io/GREMIO-ESTUDANTIL/

O GitHub Pages serve a interface estática. Para ativar o banco compartilhado, execute o servidor Node em uma hospedagem que suporte backend e configure `DATABASE_URL` para um MySQL compatível.

## Código

- `index.html`: versão compilada para o GitHub Pages.
- `app/`: código-fonte React, API Express, Dockerfile e integração MySQL.
- `app/server/`: endpoints `/api/votes`, `/api/results` e `/api/health`.

## Execução local

```bash
cd app
pnpm install
pnpm dev:api       # API em :3001
pnpm dev           # frontend em :8443
```

Sem `DATABASE_URL`, a API usa um arquivo local apenas para desenvolvimento. Em produção, use o banco MySQL e mantenha `ADMIN_PASSWORD` como variável protegida.
